// js/widgets/ButtonWidget.js

/**
 * Define y registra el ButtonWidget.
 * Se espera que IOT_RENDERER esté disponible en el scope global.
 */
(function() {
    if (typeof IOT_RENDERER === 'undefined') {
        console.error('Error: IOT_RENDERER no está definido. Asegúrate de que iotRenderer.js se cargue antes que los scripts de los widgets.');
        return;
    }

    IOT_RENDERER.registerWidget('ButtonWidget', function(config) {
        const container = document.createElement('div');
        container.className = 'widget-container card p-3 mb-3 shadow-sm';

        const title = document.createElement('h5');
        title.className = 'card-title';
        title.textContent = config.label || 'Botón';
        container.appendChild(title);

        const button = document.createElement('button');
        button.className = `btn btn-${config.variant || 'primary'}`;
        button.textContent = config.label || 'Presionar';
        button.onclick = () => {
            console.log(`Botón '${config.label}' (ID: ${config.id}) presionado.`);
            const messageToSend = JSON.stringify({
                widgetId: config.id,
                action: config.action,
                value: config.value
            });
            IOT_RENDERER.sendWebSocketMessage(messageToSend);
        };
        container.appendChild(button);

        return container;
    });

    console.log("ButtonWidget cargado y registrado.");
})();