// js/widgets/SwitchWidget.js (con lógica de confirmación y reversión)

/**
 * Define y registra el SwitchWidget.
 * Muestra un control de tipo "toggle switch" de Bootstrap que cambia su texto
 * y envía un valor configurable al Arduino según su estado (ON/OFF).
 * El widget espera confirmación del Arduino y revierte su estado visual si no la recibe.
 * También puede ser actualizado por mensajes del Arduino.
 * Se espera que IOT_RENDERER esté disponible en el scope global.
 */
(function() {
    if (typeof IOT_RENDERER === 'undefined') {
        console.error('ERROR CRÍTICO: IOT_RENDERER no está definido. Asegúrate de que iotRenderer.js se cargue antes que los scripts de los widgets.');
        return;
    }

    IOT_RENDERER.registerWidget('SwitchWidget', function(config) {
        const container = document.createElement('div');
        container.className = 'widget-container card p-3 mb-3 shadow-sm';
        container.id = config.id;

        const title = document.createElement('h5');
        title.className = 'card-title';
        title.textContent = config.label || 'Interruptor';
        container.appendChild(title);

        const switchContainer = document.createElement('div');
        switchContainer.className = 'form-check form-switch mt-3 d-flex align-items-center';

        const switchInput = document.createElement('input');
        switchInput.type = 'checkbox';
        switchInput.role = 'switch';
        switchInput.className = 'form-check-input';
        const inputId = `switch-${config.id || Math.random().toString(36).substr(2, 9)}`;
        switchInput.id = inputId;

        const switchLabel = document.createElement('label');
        switchLabel.className = 'form-check-label fw-bold ms-3';
        switchLabel.setAttribute('for', inputId);

        // Configuración de textos y valores por defecto
        const onText = config.onText || 'ENCENDIDO';
        const offText = config.offText || 'APAGADO';
        const pendingText = config.pendingText || 'PENDIENTE...'; // Nuevo texto para estado pendiente
        const onValue = config.onValue !== undefined ? config.onValue : 'ON';
        const offValue = config.offValue !== undefined ? config.offValue : 'OFF';

        // Estado interno del widget (para controlar la reversión)
        let currentState = String(config.initialState).toUpperCase() === String(onValue).toUpperCase() ? onValue : offValue;
        let isWaitingForConfirmation = false; // Bandera para saber si estamos esperando respuesta del Arduino
        let confirmationTimeoutId = null; // ID del timeout para la reversión

        const CONFIRMATION_TIMEOUT_MS = config.confirmationTimeout || 3000; // 3 segundos para confirmación

        // Función interna para actualizar la UI del switch (checkbox y texto)
        const updateSwitchUI = (state) => {
            switchInput.disabled = isWaitingForConfirmation; // Deshabilita el switch mientras se espera confirmación
            if (isWaitingForConfirmation) {
                switchLabel.textContent = pendingText;
            } else if (String(state).toUpperCase() === String(onValue).toUpperCase()) {
                switchInput.checked = true;
                switchLabel.textContent = onText;
            } else {
                switchInput.checked = false;
                switchLabel.textContent = offText;
            }
        };

        // Establecer el estado inicial del LED al crearse
        updateSwitchUI(currentState);

        // Función para enviar el estado actual por WebSocket
        const sendCommandToArduino = (valueToSet) => {
            console.log(`DEBUG: Enviando comando '${valueToSet}' para switch '${config.label}' (ID: ${config.id}).`);
            const messageToSend = JSON.stringify({
                widgetId: config.id,
                action: config.action,
                value: valueToSet
            });
            IOT_RENDERER.sendWebSocketMessage(messageToSend);
        };

        // Manejador de eventos para cuando el usuario cambia el switch
        switchInput.onchange = () => {
            // Guardamos el estado que el usuario INTENTÓ establecer
            const desiredState = switchInput.checked ? onValue : offValue;
            
            // Si ya estamos esperando confirmación, ignoramos el clic del usuario
            if (isWaitingForConfirmation) {
                console.warn(`WARN: Switch '${config.label}' - Clic ignorado, esperando confirmación previa.`);
                return;
            }

            // Si el estado intentado es el mismo que el actual, no hacer nada (evita envíos redundantes)
            if (desiredState === currentState) {
                console.log(`DEBUG: Switch '${config.label}' - Ya en el estado deseado '${desiredState}'.`);
                updateSwitchUI(currentState); // Asegurar que la UI refleja el estado actual
                return;
            }

            console.log(`DEBUG: Usuario intentó cambiar '${config.label}' a '${desiredState}'.`);
            isWaitingForConfirmation = true;
            updateSwitchUI(desiredState); // Mostrar estado pendiente o el estado deseado visualmente

            // Enviar el comando
            sendCommandToArduino(desiredState);

            // Iniciar un timeout para revertir el estado si no hay confirmación
            confirmationTimeoutId = setTimeout(() => {
                if (isWaitingForConfirmation) {
                    console.warn(`WARN: Switch '${config.label}' - No se recibió confirmación de Arduino para '${desiredState}'. Revertiendo a estado anterior: '${currentState}'.`);
                    isWaitingForConfirmation = false;
                    switchInput.checked = (String(currentState).toUpperCase() === String(onValue).toUpperCase()); // Revertir visualmente
                    updateSwitchUI(currentState); // Actualizar la UI con el estado anterior
                    alert(`El sistema no respondió a tiempo. ${config.label} revertido a ${currentState === onValue ? onText : offText}.`);
                }
            }, CONFIRMATION_TIMEOUT_MS);
        };

        switchContainer.appendChild(switchInput);
        switchContainer.appendChild(switchLabel);
        container.appendChild(switchContainer);

        /**
         * Función para actualizar el estado del switch desde una fuente externa (ej. Arduino).
         * Esta función se adjunta al elemento DOM para que IOT_RENDERER.js pueda llamarla.
         * @param {string|boolean} newState - El nuevo estado ('ON', 'OFF', true, false, o los valores configurados).
         */
        container.updateState = function(newState) {
            let actualStateFromArduino;
            // Normalizar el estado recibido del Arduino a onValue/offValue
            if (String(newState).toUpperCase() === String(onValue).toUpperCase() || newState === true) {
                actualStateFromArduino = onValue;
            } else if (String(newState).toUpperCase() === String(offValue).toUpperCase() || newState === false) {
                actualStateFromArduino = offValue;
            } else {
                console.warn(`WARN: Estado desconocido recibido para SwitchWidget '${config.id}': ${newState}. Ignorando actualización.`);
                return;
            }
            
            // Si estábamos esperando una confirmación para este estado, cancelamos el timeout
            if (isWaitingForConfirmation && actualStateFromArduino === (switchInput.checked ? onValue : offValue)) {
                clearTimeout(confirmationTimeoutId);
                confirmationTimeoutId = null;
                isWaitingForConfirmation = false;
                console.log(`DEBUG: Switch '${config.label}' - Confirmación recibida para '${actualStateFromArduino}'.`);
            } else if (isWaitingForConfirmation && actualStateFromArduino !== (switchInput.checked ? onValue : offValue)) {
                 // Si recibimos una confirmación pero no es el estado que esperábamos,
                 // significa que el Arduino cambió el estado a algo diferente.
                 // Cancelamos el timeout y actualizamos al estado que el Arduino reporta.
                 clearTimeout(confirmationTimeoutId);
                 confirmationTimeoutId = null;
                 isWaitingForConfirmation = false;
                 console.warn(`WARN: Switch '${config.label}' - Conflicto de estado. Arduino reporta '${actualStateFromArduino}', esperábamos '${switchInput.checked ? onValue : offValue}'. Actualizando a estado de Arduino.`);
            }

            // Solo actualizar si el estado reportado por Arduino es diferente al estado interno actual
            if (actualStateFromArduino !== currentState) {
                currentState = actualStateFromArduino; // Actualizar el estado interno
                updateSwitchUI(currentState); // Actualizar la UI
                console.log(`DEBUG: Switch '${config.label}' (ID: ${config.id}) - Estado actualizado por Arduino a: ${currentState}`);
            } else {
                console.log(`DEBUG: Switch '${config.label}' (ID: ${config.id}) - Arduino confirma estado actual: ${currentState}.`);
                // Si el estado ya es el mismo, solo asegurar que la UI no está en 'pendiente'
                isWaitingForConfirmation = false;
                clearTimeout(confirmationTimeoutId); // Limpiar por si acaso
                confirmationTimeoutId = null;
                updateSwitchUI(currentState);
            }
        };

        return container;
    });

    console.log("SwitchWidget cargado y registrado.");
})();