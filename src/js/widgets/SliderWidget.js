// js/widgets/SliderWidget.js (AJUSTADO: Sincronización inicial más robusta)

/**
 * Define y registra el SliderWidget.
 * Permite enviar un valor numérico dentro de un rango a través de un deslizador.
 * Se espera que IOT_RENDERER esté disponible en el scope global.
 */
(function() {
    if (typeof IOT_RENDERER === 'undefined') {
        console.error('Error: IOT_RENDERER no está definido. Asegúrate de que iotRenderer.js se cargue antes que los scripts de los widgets.');
        return;
    }

    IOT_RENDERER.registerWidget('SliderWidget', function(config) {
        const container = document.createElement('div');
        container.className = 'widget-container card p-3 mb-3 shadow-sm';
        container.id = config.id;

        const title = document.createElement('h5');
        title.className = 'card-title';
        title.textContent = config.label || 'Control Deslizante';
        container.appendChild(title);

        const rangeId = `range-${config.id || Math.random().toString(36).substr(2, 9)}`; 

        const labelAndValue = document.createElement('div');
        labelAndValue.className = 'd-flex justify-content-between align-items-center mb-2';
        container.appendChild(labelAndValue);

        const inputLabel = document.createElement('label');
        inputLabel.setAttribute('for', rangeId);
        inputLabel.className = 'form-label mb-0';
        inputLabel.textContent = config.inputLabel || 'Valor:';
        labelAndValue.appendChild(inputLabel);

        const currentValueSpan = document.createElement('span');
        currentValueSpan.className = 'badge bg-primary fs-6';
        // Inicializa el texto con el valor mínimo del slider.
        currentValueSpan.textContent = config.min !== undefined ? config.min : 0; 
        labelAndValue.appendChild(currentValueSpan);

        const sliderInput = document.createElement('input');
        sliderInput.type = 'range';
        sliderInput.className = 'form-range';
        sliderInput.id = rangeId;
        
        sliderInput.min = config.min !== undefined ? config.min : 0;
        sliderInput.max = config.max !== undefined ? config.max : 100;
        sliderInput.step = config.step !== undefined ? config.step : 1;
        // Inicializa el valor del input a min.
        sliderInput.value = config.min !== undefined ? config.min : 0; 

        container.isReady = false; 
        let debounceTimeout = null;

        const sendSliderValue = (value) => {
            console.log(`DEBUG: Slider '${config.label}' (ID: ${config.id}) - Enviando: '${value}'.`);
            const messageToSend = JSON.stringify({
                widgetId: config.id,
                action: config.action,
                value: value
            });
            IOT_RENDERER.sendWebSocketMessage(messageToSend);
        };

        sliderInput.oninput = () => { 
            currentValueSpan.textContent = sliderInput.value; 
            
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }
            debounceTimeout = setTimeout(() => {
                sendSliderValue(sliderInput.value);
            }, config.debounceTime || 50);
        };
        
        container.appendChild(sliderInput);

        container.updateState = function(value) {
            const parsedValue = parseFloat(value);
            if (!isNaN(parsedValue)) {
                // Forzar la actualización del slider y el texto,
                // especialmente útil para la sincronización inicial.
                sliderInput.value = parsedValue;
                currentValueSpan.textContent = parsedValue;
                console.log(`DEBUG: Slider '${config.label}' (ID: ${config.id}) - Estado actualizado por mensaje a: ${parsedValue}.`);
            } else {
                console.warn(`WARN: Valor no numérico recibido para SliderWidget '${config.id}': ${value}. Ignorando.`);
            }
        };

        container.postRender = function() {
            return new Promise(resolve => {
                setTimeout(() => {
                    container.isReady = true;
                    console.log(`DEBUG: SliderWidget '${config.id}' completamente renderizado y listo.`);
                    
                    // Aquí, una vez que el slider está "listo", podríamos solicitar al ESP32
                    // que reenvíe su estado, o asegurarnos de que el mensaje inicial
                    // si ya llegó, se procese bien.
                    // El iotRenderer ya tiene el buffer, por lo que el mensaje debería ser reenviado.
                    resolve();
                }, 50); 
            });
        };

        return container;
    });

    console.log("SliderWidget cargado y registrado.");
})();
