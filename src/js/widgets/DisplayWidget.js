// js/widgets/DisplayWidget.js

/**
 * Define y registra el DisplayWidget.
 * Muestra un valor numérico recibido del Arduino, con una etiqueta y una unidad configurable.
 * Se espera que IOT_RENDERER esté disponible en el scope global.
 */
(function() {
    if (typeof IOT_RENDERER === 'undefined') {
        console.error('ERROR CRÍTICO: IOT_RENDERER no está definido. Asegúrate de que iotRenderer.js se cargue antes que los scripts de los widgets.');
        return;
    }

    IOT_RENDERER.registerWidget('DisplayWidget', function(config) {
        const container = document.createElement('div');
        container.className = 'widget-container card p-3 mb-3 shadow-sm text-center';
        container.id = config.id; // Asignamos el ID para poder referenciarlo desde iotRenderer.js

        const title = document.createElement('h5');
        title.className = 'card-title';
        title.textContent = config.label || 'Valor';
        container.appendChild(title);

        const valueDisplay = document.createElement('div');
        valueDisplay.className = 'display-value fw-bold fs-2 mt-2'; // Estilo para el valor grande
        container.appendChild(valueDisplay);

        const unitDisplay = document.createElement('div');
        unitDisplay.className = 'display-unit text-muted fs-6'; // Estilo para la unidad
        unitDisplay.textContent = config.unit || ''; // Mostrar la unidad si está configurada
        container.appendChild(unitDisplay);

        // Configuración de formato
        const decimalPlaces = config.decimalPlaces !== undefined ? config.decimalPlaces : 2;
        const defaultValue = config.defaultValue !== undefined ? config.defaultValue : 'N/A'; // Valor por defecto si no hay datos

        /**
         * Función para actualizar el valor numérico del display.
         * Esta función se adjunta al elemento DOM para que IOT_RENDERER.js pueda llamarla.
         * @param {number|string} newValue - El nuevo valor a mostrar.
         */
        container.updateState = function(newValue) {
            let parsedValue = parseFloat(newValue);

            if (isNaN(parsedValue)) {
                valueDisplay.textContent = defaultValue;
                console.warn(`WARN: Valor no numérico recibido para DisplayWidget '${config.id}': ${newValue}. Mostrando '${defaultValue}'.`);
            } else {
                valueDisplay.textContent = parsedValue.toFixed(decimalPlaces);
                console.log(`DisplayWidget '${config.label}' (ID: ${config.id}) - Valor: ${parsedValue.toFixed(decimalPlaces)} ${config.unit||''}`);
            }
        };

        // Establecer el valor inicial del display al crearse
        const initialValue = config.initialValue !== undefined ? config.initialValue : defaultValue;
        container.updateState(initialValue);

        return container;
    });

    console.log("DisplayWidget cargado y registrado.");
})();