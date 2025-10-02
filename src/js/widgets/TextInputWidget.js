// js/widgets/TextInputWidget.js (MEJORADO: Con confirmación y reversión)

/**
 * Define y registra el TextInputWidget.
 * Permite enviar texto o números desde un campo de entrada.
 * Envía el valor al servidor IoT y espera una confirmación.
 * Se actualiza con el valor real del servidor y revierte si no hay confirmación a tiempo.
 * Se espera que IOT_RENDERER esté disponible en el scope global.
 */
(function() {
    if (typeof IOT_RENDERER === 'undefined') {
        console.error('Error: IOT_RENDERER no está definido. Asegúrate de que iotRenderer.js se cargue antes que los scripts de los widgets.');
        return;
    }

    IOT_RENDERER.registerWidget('TextInputWidget', function(config) {
        const container = document.createElement('div');
        container.className = 'widget-container card p-3 mb-3 shadow-sm';
        container.id = config.id; // ¡Crucial para la sincronización!

        const title = document.createElement('h5');
        title.className = 'card-title';
        title.textContent = config.label || 'Entrada de Texto/Número';
        container.appendChild(title);

        const formGroup = document.createElement('div');
        formGroup.className = 'mb-3';

        const inputId = `input-${config.id || Math.random().toString(36).substr(2, 9)}`; 
        const inputLabel = document.createElement('label');
        inputLabel.setAttribute('for', inputId);
        inputLabel.className = 'form-label';
        inputLabel.textContent = config.inputLabel || (config.inputType === 'number' ? 'Valor Numérico' : 'Texto a Enviar');
        formGroup.appendChild(inputLabel);

        const inputField = document.createElement('input');
        inputField.type = config.inputType || 'text'; 
        inputField.className = 'form-control';
        inputField.id = inputId;
        inputField.placeholder = config.placeholder || 'Introduce tu mensaje aquí...';
        
        if (config.inputType === 'number') {
            if (config.min !== undefined) inputField.min = config.min;
            if (config.max !== undefined) inputField.max = config.max;
            if (config.step !== undefined) inputField.step = config.step;
        }

        formGroup.appendChild(inputField);
        container.appendChild(formGroup);

        const sendButton = document.createElement('button');
        sendButton.className = `btn btn-${config.variant || 'info'}`;
        sendButton.textContent = config.sendButtonLabel || 'Enviar';
        container.appendChild(sendButton);

        // --- Lógica de Confirmación y Reversión ---
        let currentDisplayedValue = config.initialValue !== undefined ? String(config.initialValue) : '';
        let isWaitingForConfirmation = false;
        let confirmationTimeoutId = null;
        const CONFIRMATION_TIMEOUT_MS = config.confirmationTimeout || 3000;
        const pendingText = config.pendingText || 'Enviando...';
        const sendButtonOriginalText = sendButton.textContent;

        const updateUIState = (value, waiting) => {
            inputField.value = value;
            inputField.disabled = waiting;
            sendButton.disabled = waiting;
            isWaitingForConfirmation = waiting;
            sendButton.textContent = waiting ? pendingText : sendButtonOriginalText;
            currentDisplayedValue = value;
        };

        // Inicializar con el valor actual o por defecto
        updateUIState(currentDisplayedValue, false);

        sendButton.onclick = () => {
            const valueToSend = inputField.value;

            if (valueToSend.trim() === '') {
                alert('El campo no puede estar vacío.');
                return;
            }
            if (isWaitingForConfirmation) {
                console.warn(`WARN: TextInput '${config.label}' - Clic ignorado, esperando confirmación previa.`);
                return;
            }

            console.log(`DEBUG: Usuario intentó enviar '${config.label}': '${valueToSend}'.`);
            isWaitingForConfirmation = true;
            updateUIState(valueToSend, true); // Actualizar UI a estado pendiente

            const messageToSend = JSON.stringify({
                widgetId: config.id,
                action: config.action,
                value: valueToSend
            });
            IOT_RENDERER.sendWebSocketMessage(messageToSend);
            
            // Iniciar un timeout para revertir si no hay confirmación
            confirmationTimeoutId = setTimeout(() => {
                if (isWaitingForConfirmation) {
                    console.warn(`WARN: TextInput '${config.label}' - No se recibió confirmación de Arduino para '${valueToSend}'. Revertiendo a estado anterior: '${currentDisplayedValue}'.`);
                    updateUIState(currentDisplayedValue, false); // Revertir al último estado confirmado
                    alert(`El sistema no respondió a tiempo. ${config.label} revertido a '${currentDisplayedValue}'.`);
                }
            }, CONFIRMATION_TIMEOUT_MS);
        };

        // Esta es la función CLAVE que recibe el estado del ESP32
        container.updateState = function(newValue) {
            let actualValueFromArduino = String(newValue);

            if (isWaitingForConfirmation) {
                // Si estábamos esperando confirmación, y el valor es el mismo, lo confirmamos.
                if (actualValueFromArduino === inputField.value) {
                    clearTimeout(confirmationTimeoutId);
                    confirmationTimeoutId = null;
                    console.log(`DEBUG: TextInput '${config.label}' - Confirmación recibida para '${actualValueFromArduino}'.`);
                    updateUIState(actualValueFromArduino, false);
                    if (config.clearOnSend) { // Limpiar si configurado, solo después de la confirmación
                        inputField.value = '';
                    }
                } else {
                    // Si el Arduino envió un valor diferente, es un conflicto o un cambio externo
                    clearTimeout(confirmationTimeoutId);
                    confirmationTimeoutId = null;
                    console.warn(`WARN: TextInput '${config.label}' - Conflicto de estado. Arduino reporta '${actualValueFromArduino}', esperábamos '${inputField.value}'. Actualizando a estado de Arduino.`);
                    updateUIState(actualValueFromArduino, false);
                }
            } else {
                // Si no estábamos esperando confirmación (ej. al inicio o cambio externo del ESP32)
                if (actualValueFromArduino !== currentDisplayedValue) {
                    console.log(`DEBUG: TextInput '${config.label}' (ID: ${config.id}) - Estado actualizado por Arduino a: '${actualValueFromArduino}'.`);
                    updateUIState(actualValueFromArduino, false);
                } else {
                     console.log(`DEBUG: TextInput '${config.label}' (ID: ${config.id}) - Arduino confirma estado actual: '${actualValueFromArduino}'.`);
                }
            }
        };

        // NUEVO: Método postRender que resuelve una promesa
        container.postRender = function() {
            return new Promise(resolve => {
                setTimeout(() => {
                    container.isReady = true;
                    console.log(`DEBUG: TextInputWidget '${config.id}' completamente renderizado y listo.`);
                    resolve();
                }, 50); // Pequeño retraso para asegurar que el DOM está completamente procesado
            });
        };

        return container;
    });

    console.log("TextInputWidget cargado y registrado.");
})();
