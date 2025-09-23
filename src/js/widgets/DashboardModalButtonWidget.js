// js/widgets/DashboardModalButtonWidget.js

/**
 * Define y registra el DashboardModalButtonWidget.
 * Al hacer clic, abre un modal y renderiza un dashboard secundario definido por un JSON.
 * Se espera que IOT_RENDERER esté disponible en el scope global y Bootstrap.
 */
(function() {
    if (typeof IOT_RENDERER === 'undefined') {
        console.error('ERROR CRÍTICO: IOT_RENDERER no está definido. Asegúrate de que iotRenderer.js se cargue antes que los scripts de los widgets.');
        return;
    }
    // Verificar si Bootstrap está cargado para el modal
    if (typeof bootstrap === 'undefined' || typeof bootstrap.Modal === 'undefined') {
        console.error('ERROR CRÍTICO: Bootstrap Modal no está definido. Asegúrate de que Bootstrap JS se cargue antes que los scripts de los widgets que usan modales.');
        return;
    }

    IOT_RENDERER.registerWidget('DashboardModalButtonWidget', function(config) {
        const container = document.createElement('div');
        container.className = 'widget-container card p-3 mb-3 shadow-sm';
        container.id = config.id;

        const title = document.createElement('h5');
        title.className = 'card-title';
        title.textContent = config.label || 'Abrir Dashboard';
        container.appendChild(title);

        const button = document.createElement('button');
        button.className = `btn btn-${config.variant || 'primary'} mt-2`;
        button.textContent = config.buttonText || 'Ver Detalles';
        button.onclick = () => {
            if (config.dashboardJsonPath) {
                console.log(`DEBUG: Abriendo modal para dashboard: ${config.dashboardJsonPath}`);
                IOT_RENDERER.openDashboardModal(config.modalTitle || config.label, config.dashboardJsonPath);
            } else {
                console.error(`ERROR: DashboardModalButtonWidget '${config.id}' no tiene 'dashboardJsonPath' configurado.`);
                alert('Error: No se especificó la ruta del dashboard secundario.');
            }
        };
        container.appendChild(button);

        return container;
    });

    console.log("DashboardModalButtonWidget cargado y registrado.");
})();