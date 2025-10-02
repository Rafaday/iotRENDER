// js/iotRenderer.js

const IOT_RENDERER = {
    widgetRenderers: {},
    websocket: null,
    messageBuffer: [], 
    dashboardFullyReady: false, 
    currentModalInstance: null, 
    modalDashboardAreaId: 'iot-modal-dashboard-area', 

    attemptSendDashboardReady: function() {
        if (this.dashboardFullyReady && this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            console.log('DEBUG: Ambas condiciones (dashboard listo y WS abierto) cumplidas. Enviando DASHBOARD_READY.');
            this.sendWebSocketMessage(JSON.stringify({
                widgetId: "dashboard",
                action: "DASHBOARD_READY",
                value: "true"
            }));
        } else {
            console.log(`DEBUG: Aún no listo para enviar DASHBOARD_READY. Dashboard Ready: ${this.dashboardFullyReady}, WS State: ${this.websocket ? this.websocket.readyState : 'null'}`);
        }
    },

    initWebSocket: function(url) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            console.log('DEBUG: WebSocket ya está conectado. No se inicializa de nuevo.');
            return;
        }
        if (this.websocket) {
            console.log('DEBUG: WebSocket existente detectado (no abierto). Cerrando antes de reintentar.');
            this.websocket.close(1000, "Reinitializing connection");
            this.websocket = null;
        }

        try {
            this.websocket = new WebSocket(url);
            console.log('DEBUG: Intentando establecer conexión WebSocket con:', url);

            this.websocket.onopen = () => {
                console.log('Conexión WebSocket establecida con:', url);
                this.attemptSendDashboardReady(); 

                if (this.dashboardFullyReady && this.messageBuffer.length > 0) {
                    console.log(`DEBUG: Procesando ${this.messageBuffer.length} mensajes en el buffer después de conectar.`);
                    this.messageBuffer.forEach(bufferedMessage => this.processIncomingMessage(bufferedMessage));
                    this.messageBuffer = []; 
                }
            };

            this.websocket.onmessage = (event) => {
                if (!this.dashboardFullyReady) {
                    this.messageBuffer.push(event.data);
                } else {
                    this.processIncomingMessage(event.data);
                }
            };

            this.processIncomingMessage = function(messageData) {
                try {
                    const data = JSON.parse(messageData);

                    const targetWidgetElement = document.getElementById(data.widgetId);
                    if (targetWidgetElement && typeof targetWidgetElement.updateState === 'function') {
                        targetWidgetElement.updateState(data.status);
                    } else {
                        console.warn(`WARN: Widget '${data.widgetId}' NO LISTO para updateState. Reenviando a buffer.`);
                        IOT_RENDERER.messageBuffer.push(messageData);
                        setTimeout(() => {
                            if (IOT_RENDERER.messageBuffer.length > 0) {
                                console.log('DEBUG: Reintentando procesar mensajes del buffer...');
                                IOT_RENDERER.messageBuffer.forEach(bufferedMessage => IOT_RENDERER.processIncomingMessage(bufferedMessage));
                                IOT_RENDERER.messageBuffer = [];
                            }
                        }, 500); 
                    }

                    if (IOT_RENDERER.currentModalInstance && document.getElementById(IOT_RENDERER.modalDashboardAreaId)) {
                        const modalWidgetElement = document.getElementById(IOT_RENDERER.modalDashboardAreaId).querySelector(`#${data.widgetId}`);
                        if (modalWidgetElement && typeof modalWidgetElement.updateState === 'function') {
                            modalWidgetElement.updateState(data.status);
                            console.log(`DEBUG: Mensaje para widget '${data.widgetId}' también aplicado al modal.`);
                        }
                    }

                } catch (e) {
                    console.warn('WARN: Mensaje WebSocket no es JSON o hubo un error al parsear:', messageData, e);
                }
            };

            this.websocket.onerror = (error) => {
                console.error('ERROR: Error en WebSocket:', error);
                const dashboardArea = document.getElementById('iot-dashboard-area');
                if (dashboardArea) {
                    let errorDiv = document.createElement('div');
                    if (!errorDiv) { 
                        errorDiv.id = 'websocket-error-message';
                        errorDiv.className = 'alert alert-danger text-center mt-3';
                        dashboardArea.prepend(errorDiv);
                    }
                    errorDiv.textContent = `Error de conexión WebSocket. Asegúrate de que la URL '${url}' es correcta y el servidor está funcionando.`;
                }
            };

            this.websocket.onclose = (event) => {
                console.log('Conexión WebSocket cerrada:', event.code, event.reason);
                const dashboardArea = document.getElementById('iot-dashboard-area');
                if (dashboardArea) {
                    let errorDiv = document.createElement('div');
                    if (!errorDiv) { 
                        errorDiv.id = 'websocket-error-message';
                        errorDiv.className = 'alert alert-warning text-center mt-3';
                        dashboardArea.prepend(errorDiv);
                    }
                    errorDiv.textContent = `Conexión WebSocket cerrada. Intentando reconectar en 5 segundos...`;
                }
                setTimeout(() => this.initWebSocket(url), 5000);
            };
        } catch (e) {
            console.error('ERROR CRÍTICO: Fallo al crear la instancia de WebSocket:', e);
            const dashboardArea = document.getElementById('iot-dashboard-area');
            if (dashboardArea) {
                let errorDiv = document.createElement('div');
                if (!errorDiv) { 
                    errorDiv.id = 'websocket-error-message';
                    errorDiv.className = 'alert alert-danger text-center mt-3';
                    dashboardArea.prepend(errorDiv);
                }
                errorDiv.textContent = `Error al iniciar la conexión WebSocket: ${e.message}. Verifica la URL y la conexión.`;
            }
            this.websocket = null; 
        }
    },

    sendWebSocketMessage: function(message) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(message);
            console.log('Mensaje enviado por WebSocket:', message);
            const errorDiv = document.getElementById('websocket-error-message');
            if (errorDiv) {
                errorDiv.remove();
            }
        } else {
            console.warn('WARN: WebSocket no está conectado o está cerrándose. No se pudo enviar el mensaje:', message);
            // alert('Error: WebSocket no conectado. Asegúrate de que tu Arduino está ejecutando el servidor WebSocket.'); 
        }
    },

    registerWidget: function(type, renderFunction) {
        this.widgetRenderers[type] = renderFunction;
        console.log(`Widget '${type}' registrado.`);
    },

    renderWidget: function(widgetConfig) {
        const renderer = this.widgetRenderers[widgetConfig.type];
        if (renderer) {
            return renderer(widgetConfig);
        } else {
            console.error(`ERROR: Tipo de widget desconocido: ${widgetConfig.type}. Asegúrate de que el script del widget esté cargado.`);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger';
            errorDiv.textContent = `Error: Widget de tipo '${widgetConfig.type}' no encontrado.`;
            return errorDiv;
        }
    },

    renderDashboard: function(dashboardConfig, targetElementId) {
        const isMainDashboard = (targetElementId === 'iot-dashboard-area');
        if (isMainDashboard) {
            this.dashboardFullyReady = false; 
        }

        const targetElement = document.getElementById(targetElementId);
        if (!targetElement) {
            console.error(`ERROR: Elemento objetivo '${targetElementId}' no encontrado.`);
            return Promise.reject(new Error(`Elemento objetivo '${targetElementId}' no encontrado.`));
        }

        targetElement.innerHTML = ''; 

        const title = document.createElement('h1');
        title.className = 'text-center mb-4';
        title.textContent = dashboardConfig.title || 'Dashboard IoT';
        targetElement.appendChild(title);

        const postRenderPromises = []; 

        dashboardConfig.rows.forEach(rowConfig => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'row mb-4';
            rowDiv.id = rowConfig.id;

            rowConfig.columns.forEach(colConfig => {
                const colDiv = document.createElement('div');
                colDiv.className = `col-12 col-md-${colConfig.span || 12} mb-3`;
                colDiv.id = colConfig.id;

                const colContentDiv = document.createElement('div');
                colContentDiv.className = 'dashboard-column border p-3 bg-light rounded shadow-sm h-100';

                if (colConfig.widgets && colConfig.widgets.length > 0) {
                    colConfig.widgets.forEach(widgetConfig => {
                        const widgetElement = this.renderWidget(widgetConfig);
                        if (widgetElement) {
                            colContentDiv.appendChild(widgetElement);
                            if (typeof widgetElement.postRender === 'function') {
                                postRenderPromises.push(widgetElement.postRender());
                            }
                        }
                    });
                } else {
                    const emptyMessage = document.createElement('p');
                    emptyMessage.className = 'text-muted text-center p-3';
                    emptyMessage.textContent = 'Columna vacía';
                    colContentDiv.appendChild(emptyMessage);
                }
                colDiv.appendChild(colContentDiv);
                rowDiv.appendChild(colDiv);
            });
            targetElement.appendChild(rowDiv);
        });
        
        console.log(`Dashboard '${dashboardConfig.title}' renderizado en '${targetElementId}'. Esperando postRender.`);

        return Promise.all(postRenderPromises).then(() => {
            console.log(`DEBUG: Todos los postRender de widgets para '${dashboardConfig.title}' han finalizado.`);
            if (isMainDashboard) { 
                this.dashboardFullyReady = true; 
                this.attemptSendDashboardReady(); 

                if (this.messageBuffer.length > 0) {
                    console.log(`DEBUG: Procesando ${this.messageBuffer.length} mensajes en el buffer después del renderizado completo.`);
                    this.messageBuffer.forEach(bufferedMessage => this.processIncomingMessage(bufferedMessage));
                    this.messageBuffer = []; 
                }
            }
        }).catch(error => {
            console.error(`ERROR: Uno o más postRender de widgets para '${dashboardConfig.title}' fallaron:`, error);
            throw error;
        });
    },

    openDashboardModal: function(modalTitle, dashboardJsonPath) {
        const modalElement = document.getElementById('iotDashboardModal');
        if (!modalElement) {
            console.error('ERROR: El elemento modal #iotDashboardModal no se encontró en el DOM.');
            alert('Error: No se puede abrir el modal del dashboard.');
            return;
        }

        const modalTitleElement = modalElement.querySelector('.modal-title');
        const modalBodyElement = modalElement.querySelector('.modal-body');

        if (modalTitleElement) modalTitleElement.textContent = modalTitle;
        if (modalBodyElement) {
            modalBodyElement.innerHTML = `<div id="${this.modalDashboardAreaId}" class="p-3"><div class="text-center p-5 text-muted">Cargando dashboard secundario...</div></div>`;
        }

        this.currentModalInstance = new bootstrap.Modal(modalElement);
        this.currentModalInstance.show();

        fetch(dashboardJsonPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(dashboardConfig => {
                console.log(`DEBUG: Configuración del dashboard secundario '${modalTitle}' cargada.`, dashboardConfig);
                return this.renderDashboard(dashboardConfig, this.modalDashboardAreaId);
            })
            .then(() => {
                console.log(`DEBUG: Dashboard secundario '${modalTitle}' renderizado con éxito.`);
            })
            .catch(error => {
                console.error(`ERROR: Fallo al cargar o renderizar el dashboard secundario '${modalTitle}':`, error);
                if (modalBodyElement) {
                    modalBodyElement.innerHTML = `<div class="alert alert-danger text-center mt-3">
                        Error al cargar el dashboard secundario: ${error.message}
                    </div>`;
                }
            });

        modalElement.addEventListener('hidden.bs.modal', () => {
            this.currentModalInstance = null;
            if (modalBodyElement) {
                modalBodyElement.innerHTML = '';
            }
            console.log(`DEBUG: Modal '${modalTitle}' cerrado y contenido limpiado.`);
        }, { once: true });
    },

    closeDashboardModal: function() {
        if (this.currentModalInstance) {
            this.currentModalInstance.hide();
        }
    }
};
