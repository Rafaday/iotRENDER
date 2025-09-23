// js/widgets/TextInputWidget.js

/**
 * Define y registra el TextInputWidget.
 * Permite enviar texto o números desde un campo de entrada.
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

        const title = document.createElement('h5');
        title.className = 'card-title';
        title.textContent = config.label || 'Entrada de Texto/Número';
        container.appendChild(title);

        const formGroup = document.createElement('div');
        formGroup.className = 'mb-3';

        const inputId = `input-${config.id || Math.random().toString(36).substr(2, 9)}`; // Generar un ID único si no se proporciona
        const inputLabel = document.createElement('label');
        inputLabel.setAttribute('for', inputId);
        inputLabel.className = 'form-label';
        inputLabel.textContent = config.inputLabel || (config.inputType === 'number' ? 'Valor Numérico' : 'Texto a Enviar');
        formGroup.appendChild(inputLabel);

        const inputField = document.createElement('input');
        inputField.type = config.inputType || 'text'; // Puede ser 'text', 'number', etc.
        inputField.className = 'form-control';
        inputField.id = inputId;
        inputField.placeholder = config.placeholder || 'Introduce tu mensaje aquí...';
        
        // Añadir atributos específicos para números
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
        sendButton.onclick = () => {
            const valueToSend = inputField.value;
            console.log(`Campo de texto '${config.label}' (ID: ${config.id}) - Valor a enviar: '${valueToSend}'.`);

            if (valueToSend.trim() === '') {
                alert('El campo no puede estar vacío.');
                return;
            }

            // Creamos un objeto JSON para enviar datos estructurados al Arduino
            const messageToSend = JSON.stringify({
                widgetId: config.id,      // ID del widget que se presionó
                action: config.action,    // Acción que debe realizar el Arduino (ej. "sendText", "setValue")
                value: valueToSend        // El valor introducido por el usuario
            });
            IOT_RENDERER.sendWebSocketMessage(messageToSend); // Usar la función de envío de WebSocket
            
            // Opcional: Limpiar el campo después de enviar
            if (config.clearOnSend) {
                inputField.value = '';
            }
        };
        container.appendChild(sendButton);

        return container;
    });

    console.log("TextInputWidget cargado y registrado.");
})();