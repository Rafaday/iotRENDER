// js/widgets/LedWidget.js

/**
 * Define y registra el LedWidget.
 * Muestra el estado de un LED (Encendido/Apagado) y puede actualizarse dinámicamente
 * a través de mensajes de WebSocket entrantes.
 * Se espera que IOT_RENDERER esté disponible en el scope global.
 */
(function() {
    if (typeof IOT_RENDERER === 'undefined') {
        console.error('Error: IOT_RENDERER no está definido. Asegúrate de que iotRenderer.js se cargue antes que los scripts de los widgets.');
        return;
    }

    IOT_RENDERER.registerWidget('LedWidget', function(config) {
        const container = document.createElement('div');
        container.className = 'widget-container card p-3 mb-3 shadow-sm';
        // Asignamos el ID del widget al contenedor para poder referenciarlo desde iotRenderer.js
        container.id = config.id;

        const title = document.createElement('h5');
        title.className = 'card-title';
        title.textContent = config.label || 'Estado del LED';
        container.appendChild(title);

        const ledDisplay = document.createElement('div');
        ledDisplay.className = 'd-flex align-items-center mt-2';

        const ledIndicator = document.createElement('span');
        ledIndicator.className = 'led-circle me-2'; // Clase para el círculo visual
        // Estilos básicos para el círculo. Puedes mover esto a tu CSS si lo prefieres.
        ledIndicator.style.display = 'inline-block';
        ledIndicator.style.width = '24px';
        ledIndicator.style.height = '24px';
        ledIndicator.style.borderRadius = '50%';
        ledIndicator.style.border = '1px solid #ccc';

        const statusText = document.createElement('span');
        statusText.className = 'status-text fw-bold fs-5';

        ledDisplay.appendChild(ledIndicator);
        ledDisplay.appendChild(statusText);
        container.appendChild(ledDisplay);

        // Define los colores y textos por defecto, pero permite personalización
        const onColorClass = config.onColorClass || 'bg-success';
        const offColorClass = config.offColorClass || 'bg-secondary';
        const onText = config.onText || 'ENCENDIDO';
        const offText = config.offText || 'APAGADO';

        /**
         * Función para actualizar el estado visual del LED.
         * Esta función se adjunta al elemento DOM para que IOT_RENDERER.js pueda llamarla.
         * @param {string} newState - El nuevo estado ('ON' o 'OFF'). No distingue mayúsculas/minúsculas.
         */
        container.updateState = function(newState) {
            const normalizedState = newState.toUpperCase(); // Normalizar a mayúsculas

            // Limpiar clases de estado anteriores
            ledIndicator.classList.remove(onColorClass, offColorClass);

            if (normalizedState === 'ON') {
                ledIndicator.classList.add(onColorClass);
                statusText.textContent = onText;
                console.log(`LED '${config.label}' (ID: ${config.id}) - Estado: ON`);
            } else if (normalizedState === 'OFF') {
                ledIndicator.classList.add(offColorClass);
                statusText.textContent = offText;
                console.log(`LED '${config.label}' (ID: ${config.id}) - Estado: OFF`);
            } else {
                console.warn(`Estado desconocido para LED '${config.label}' (ID: ${config.id}): ${newState}. Se establece como APAGADO.`);
                ledIndicator.classList.add(offColorClass); // Default a off
                statusText.textContent = offText; // Default a off text
            }
        };

        // Establecer el estado inicial del LED al crearse
        const initialStatus = config.initialState && config.initialState.toUpperCase() === 'ON' ? 'ON' : 'OFF';
        container.updateState(initialStatus);

        return container;
    });

    console.log("LedWidget cargado y registrado.");
})();