// js/widgets/SliderWidget.js (con envío en tiempo real y inicialización mejorada)

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
        currentValueSpan.textContent = config.min !== undefined ? config.min : 0; 
        labelAndValue.appendChild(currentValueSpan);

        const sliderInput = document.createElement('input');
        sliderInput.type = 'range';
        sliderInput.className = 'form-range';
        sliderInput.id = rangeId;
        
        sliderInput.min = config.min !== undefined ? config.min : 0;
        sliderInput.max = config.max !== undefined ? config.max : 100;
        sliderInput.step = config.step !== undefined ? config.step : 1;
        sliderInput.value = config.min !== undefined ? config.min : 0; 

        container.isReady = false; 
        let debounceTimeout = null; // Para el debounce del envío

        const sendSliderValue = (value) => {
            console.log(`DEBUG: Slider '${config.label}' (ID: ${config.id}) - Enviando: '${value}'.`);
            const messageToSend = JSON.stringify({
                widgetId: config.id,
                action: config.action,
                value: value
            });
            IOT_RENDERER.sendWebSocketMessage(messageToSend);
        };

        // --- CAMBIO CLAVE: Envío en tiempo real con debounce ---
        sliderInput.oninput = () => { 
            currentValueSpan.textContent = sliderInput.value; // Feedback visual inmediato
            
            // Limpiar el timeout anterior para evitar envíos múltiples
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }
            // Establecer un nuevo timeout para enviar el valor después de un breve período de inactividad
            debounceTimeout = setTimeout(() => {
                sendSliderValue(sliderInput.value);
            }, config.debounceTime || 50); // Valor por defecto de debounce: 50ms
        };
        // Ya no necesitamos onchange si oninput con debounce está enviando
        // sliderInput.onchange = () => { /* noop */ }; 
        // --- FIN CAMBIO CLAVE ---
        
        container.appendChild(sliderInput);

        container.updateState = function(value) {
            const parsedValue = parseFloat(value);
            if (!isNaN(parsedValue)) {
                // Solo actualizar si el slider es diferente, para evitar parpadeos innecesarios
                // y para no interrumpir el arrastre del usuario
                if (parseFloat(sliderInput.value) !== parsedValue) {
                    sliderInput.value = parsedValue;
                    currentValueSpan.textContent = parsedValue;
                    console.log(`DEBUG: Slider '${config.label}' (ID: ${config.id}) - Estado actualizado por mensaje a: ${parsedValue}.`);
                } else {
                     console.log(`DEBUG: Slider '${config.label}' (ID: ${config.id}) - Estado recibido es el mismo: ${parsedValue}.`);
                }
            } else {
                console.warn(`WARN: Valor no numérico recibido para SliderWidget '${config.id}': ${value}. Ignorando.`);
            }
        };

        container.postRender = function() {
            return new Promise(resolve => {
                setTimeout(() => {
                    container.isReady = true;
                    console.log(`DEBUG: SliderWidget '${config.id}' completamente renderizado y listo.`);
                    resolve();
                }, 50); 
            });
        };

        return container;
    });

    console.log("SliderWidget cargado y registrado.");
})();