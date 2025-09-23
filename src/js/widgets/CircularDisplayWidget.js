// js/widgets/CircularDisplayWidget.js

/**
 * Define y registra el CircularDisplayWidget.
 * Muestra un valor de porcentaje en un display circular de progreso.
 * Puede actualizarse dinámicamente a través de mensajes de WebSocket entrantes.
 * Se espera que IOT_RENDERER esté disponible en el scope global.
 */
(function() {
    if (typeof IOT_RENDERER === 'undefined') {
        console.error('Error: IOT_RENDERER no está definido. Asegúrate de que iotRenderer.js se cargue antes que los scripts de los widgets.');
        return;
    }

    IOT_RENDERER.registerWidget('CircularDisplayWidget', function(config) {
        const container = document.createElement('div');
        container.className = 'widget-container card p-3 mb-3 shadow-sm text-center';
        container.id = config.id; // Asignamos el ID para poder referenciarlo desde iotRenderer.js

        const title = document.createElement('h5');
        title.className = 'card-title';
        title.textContent = config.label || 'Porcentaje';
        container.appendChild(title);

        const svgSize = config.size || 120; // Tamaño del SVG
        const strokeWidth = config.strokeWidth || 10; // Grosor del círculo
        const radius = (svgSize / 2) - (strokeWidth / 2); // Radio ajustado al stroke
        const circumference = 2 * Math.PI * radius;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', svgSize);
        svg.setAttribute('height', svgSize);
        svg.setAttribute('viewBox', `0 0 ${svgSize} ${svgSize}`);
        svg.className = 'mt-2 mb-2';

        // Círculo de fondo
        const circleBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circleBg.setAttribute('cx', svgSize / 2);
        circleBg.setAttribute('cy', svgSize / 2);
        circleBg.setAttribute('r', radius);
        circleBg.setAttribute('stroke', config.bgColor || '#e0e0e0');
        circleBg.setAttribute('stroke-width', strokeWidth);
        circleBg.setAttribute('fill', 'transparent');
        svg.appendChild(circleBg);

        // Círculo de progreso
        const circleProgress = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circleProgress.setAttribute('cx', svgSize / 2);
        circleProgress.setAttribute('cy', svgSize / 2);
        circleProgress.setAttribute('r', radius);
        circleProgress.setAttribute('stroke', config.progressColor || '#007bff');
        circleProgress.setAttribute('stroke-width', strokeWidth);
        circleProgress.setAttribute('fill', 'transparent');
        circleProgress.setAttribute('stroke-dasharray', circumference);
        circleProgress.setAttribute('stroke-dashoffset', circumference); // Inicialmente lleno
        circleProgress.style.transformOrigin = 'center';
        circleProgress.style.transform = 'rotate(-90deg)'; // Iniciar desde arriba
        circleProgress.style.transition = 'stroke-dashoffset 0.5s ease-in-out'; // Transición suave
        svg.appendChild(circleProgress);

        // Texto del porcentaje
        const percentageText = document.createElement('div');
        percentageText.className = 'h3 mb-0';
        percentageText.style.position = 'relative';
        percentageText.style.top = `-${svgSize / 2 + 10}px`; // Centrar verticalmente en el SVG
        percentageText.style.pointerEvents = 'none'; // Para que no interfiera con eventos del SVG


        container.appendChild(svg);
        container.appendChild(percentageText);


        /**
         * Función para actualizar el valor del porcentaje del display circular.
         * Esta función se adjunta al elemento DOM para que IOT_RENDERER.js pueda llamarla.
         * @param {number} value - El nuevo valor de porcentaje (0-100).
         */
        container.updateState = function(value) {
            let percentage = parseFloat(value);
            if (isNaN(percentage)) {
                console.warn(`Valor no numérico recibido para CircularDisplayWidget '${config.id}': ${value}. Estableciendo en 0.`);
                percentage = 0;
            }
            percentage = Math.max(0, Math.min(100, percentage)); // Asegurar que esté entre 0 y 100

            const offset = circumference * (1 - percentage / 100);
            circleProgress.style.strokeDashoffset = offset;
            percentageText.textContent = `${Math.round(percentage)}%`;

            console.log(`CircularDisplayWidget '${config.label}' (ID: ${config.id}) - Porcentaje: ${percentage}%`);
        };

        // Establecer el valor inicial del display al crearse
        const initialValue = config.initialValue !== undefined ? config.initialValue : 0;
        container.updateState(initialValue);

        return container;
    });

    console.log("CircularDisplayWidget cargado y registrado.");
})();