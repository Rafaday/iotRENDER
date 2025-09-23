// js/widgets/ApexGraphWidget.js (Corregido para gestión de datos local y promesa en postRender)

/**
 * Define y registra el ApexGraphWidget.
 * Muestra la evolución de un dato a lo largo del tiempo utilizando ApexCharts.
 * Puede actualizarse dinámicamente a través de mensajes de WebSocket entrantes.
 * Se espera que IOT_RENDERER esté disponible en el scope global.
 * También se requiere ApexCharts.
 */
(function() {
    console.log('--- Iniciando ejecución de ApexGraphWidget.js ---');

    if (typeof IOT_RENDERER === 'undefined') {
        console.error('ERROR CRÍTICO EN ApexGraphWidget.js: IOT_RENDERER no está definido. Orden de carga incorrecto.');
        return;
    }
    // Verificar si ApexCharts está cargado
    if (typeof ApexCharts === 'undefined') {
        console.error('ERROR CRÍTICO EN ApexGraphWidget.js: ApexCharts no está definido. Asegúrate de que la librería ApexCharts se cargue antes que los scripts de los widgets.');
        return;
    }

    IOT_RENDERER.registerWidget('ApexGraphWidget', function(config) {
        console.log(`DEBUG: Creando estructura DOM para ApexGraphWidget con ID: ${config.id}`);

        const container = document.createElement('div');
        container.className = 'widget-container card p-3 mb-3 shadow-sm';
        container.id = config.id;

        const title = document.createElement('h5');
        title.className = 'card-title';
        title.textContent = config.label || 'Gráfico de Datos';
        container.appendChild(title);

        const chartDiv = document.createElement('div');
        const chartId = `apex-chart-${config.id || Math.random().toString(36).substr(2, 9)}`;
        chartDiv.id = chartId;
        container.appendChild(chartDiv);

        let chart; // La instancia de ApexCharts
        let chartData = []; // NUEVO: Array local para almacenar los datos del gráfico
        const maxDataPoints = config.maxDataPoints || 30;

        const defaultUpdateInterval = 1000; // 1 segundo
        const calculatedTimeRange = config.timeRange || (maxDataPoints * (config.updateInterval || defaultUpdateInterval));
        console.log(`DEBUG: Rango de tiempo calculado para ${config.id}: ${calculatedTimeRange}ms`);


        const options = {
            chart: {
                type: config.chartType || 'line',
                height: config.canvasHeight || 250,
                animations: {
                    enabled: config.animationsEnabled !== undefined ? config.animationsEnabled : true,
                    easing: 'linear',
                    dynamicAnimation: {
                        speed: config.animationSpeed || 800
                    }
                },
                toolbar: {
                    show: config.toolbarShow !== undefined ? config.toolbarShow : false
                },
                zoom: {
                    enabled: false
                },
                events: {
                    mounted: (chartContext, config) => {
                        console.log(`DEBUG: ApexChart montado para ID: ${chartContext.el.id}`);
                        // En la montura, si hay datos temporales, los aplicamos.
                        if (chartData.length > 0) {
                            console.log(`DEBUG: Aplicando ${chartData.length} datos iniciales desde buffer local en el montado.`);
                            chart.updateSeries([{ data: chartData }]);
                            // No vaciamos chartData aquí, ya es la fuente de verdad.
                        }
                    },
                    updated: (chartContext, config) => {
                        // console.log(`DEBUG: ApexChart actualizado para ID: ${chartContext.el.id}`);
                    }
                }
            },
            series: [{
                name: config.dataLabel || 'Valor',
                data: chartData // La serie inicial apunta a nuestro array local
            }],
            xaxis: {
                type: 'datetime',
                range: calculatedTimeRange,
                labels: {
                    datetimeFormatter: {
                        year: 'yyyy',
                        month: 'MMM \'yy',
                        day: 'dd MMM',
                        hour: 'HH:mm',
                        minute: 'HH:mm:ss',
                        second: 'HH:mm:ss'
                    }
                },
                title: {
                    text: 'Tiempo'
                }
            },
            yaxis: {
                type: 'numeric',
                title: {
                    text: config.unit || 'Unidad'
                },
                min: config.minY !== undefined ? config.minY : null,
                max: config.maxY !== undefined ? config.maxY : null,
                labels: {
                    formatter: function (value) {
                        if (value === null || typeof value === 'undefined' || isNaN(value)) {
                            return 'N/A';
                        }
                        return value.toFixed(config.yAxisDecimalPlaces || 0) + (config.unitSuffix || '');
                    }
                }
            },
            stroke: {
                curve: config.curve || 'smooth',
                width: config.borderWidth || 2,
                colors: [config.borderColor || '#007bff']
            },
            fill: {
                type: config.fillType || 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: config.fillOpacityFrom || 0.7,
                    opacityTo: config.fillOpacityTo || 0.9,
                    stops: [0, 100]
                },
                colors: [config.backgroundColor || 'rgba(0, 123, 255, 0.5)']
            },
            markers: {
                size: config.markerSize || 0
            },
            tooltip: {
                x: {
                    format: 'HH:mm:ss'
                },
                y: {
                    formatter: function (value) {
                        if (value === null || typeof value === 'undefined' || isNaN(value)) {
                            return config.dataLabel + ': N/A';
                        }
                        return config.dataLabel + ': ' + value.toFixed(config.tooltipDecimalPlaces || 2) + (config.unitSuffix || '');
                    }
                }
            },
            dataLabels: {
                enabled: false
            },
            grid: {
                borderColor: config.gridColor || '#e7e7e7',
                row: {
                    colors: ['#f3f3f3', 'transparent'],
                    opacity: 0.5
                },
            },
            legend: {
                show: config.showLegend !== undefined ? config.showLegend : false
            }
        };

        const normalizeDataPoint = (dataPoint) => {
            let value;
            let timestamp;

            if (typeof dataPoint === 'object' && dataPoint !== null) {
                if (dataPoint.x !== undefined && dataPoint.y !== undefined) {
                    timestamp = dataPoint.x;
                    value = parseFloat(dataPoint.y);
                } else if (dataPoint.value !== undefined) {
                    value = parseFloat(dataPoint.value);
                    timestamp = dataPoint.timestamp || Date.now();
                } else {
                    console.warn(`WARN: Formato de dato desconocido en normalizeDataPoint para '${config.id}':`, dataPoint);
                    return null;
                }
            } else { // Si dataPoint es un número directamente
                value = parseFloat(dataPoint);
                timestamp = Date.now();
            }

            if (isNaN(value)) {
                console.warn(`WARN: Valor no numérico detectado en normalizeDataPoint para '${config.id}'. Dato original:`, dataPoint);
                return null;
            }
            return { x: timestamp, y: value };
        };

        container.updateState = function(dataPoint) {
            const newPoint = normalizeDataPoint(dataPoint);
            if (!newPoint) {
                console.warn(`WARN: Dato inválido recibido para ApexGraphWidget '${config.id}'. No se añade al gráfico. Dato:`, dataPoint);
                return;
            }
            
            // Siempre añadir al array de datos local
            chartData.push(newPoint);

            // Eliminar los puntos de datos más antiguos si excedemos el límite
            while (chartData.length > maxDataPoints) {
                chartData.shift();
            }
            
            // Si el gráfico está inicializado, actualizar la serie
            if (chart && chart.initialized) {
                console.log(`DEBUG: Actualizando serie para ${config.id} con nuevos datos (último punto: ${newPoint.y} @ ${new Date(newPoint.x).toLocaleTimeString()}). Total puntos: ${chartData.length}`);
                chart.updateSeries([{ data: chartData }], false); // Pasar el array local directamente
            } else {
                console.warn(`WARN: ApexGraphWidget '${config.id}' - Gráfico no renderizado o inicializado aún. Dato añadido al buffer local.`);
            }
            
            console.log(`ApexGraphWidget '${config.label}' (ID: ${config.id}) - Nuevo dato: ${newPoint.y} ${config.unit||''} en ${new Date(newPoint.x).toLocaleTimeString()}.`);
        };

        container.postRender = function() {
            return new Promise((resolve, reject) => { // postRender ahora devuelve una promesa
                console.log(`DEBUG: Ejecutando postRender para ApexGraphWidget ID: ${config.id}`);
                
                setTimeout(() => {
                    console.log(`DEBUG: Inicializando ApexCharts para ID: ${config.id} después del retraso.`);
                    chart = new ApexCharts(chartDiv, options);
                    chart.render().then(() => {
                        chart.initialized = true; // Añadir una bandera personalizada
                        console.log(`DEBUG: ApexCharts renderizado y marcado como inicializado para ID: ${config.id}`);

                        // Una vez que el gráfico está renderizado, si hay datos en chartData (ya sean iniciales
                        // o recibidos del WebSocket), los aplicamos.
                        if (chartData.length > 0) {
                            console.log(`DEBUG: Aplicando ${chartData.length} datos iniciales a ApexGraphWidget ID: ${config.id} desde el buffer local.`);
                            chart.updateSeries([{ data: chartData }]);
                            // chartData ahora es la fuente de verdad.
                        }
                        resolve(); // Resolver la promesa cuando el gráfico esté listo
                    }).catch(error => {
                        console.error(`ERROR: Fallo al renderizar ApexCharts para ID: ${config.id}`, error);
                        reject(error);
                    });
                }, 300); // Mantenemos un retraso de 300ms
            });
        };

        // Almacenar datos iniciales proporcionados en la configuración directamente en chartData.
        if (config.initialData && Array.isArray(config.initialData)) {
            config.initialData.forEach(item => {
                const normalized = normalizeDataPoint(item);
                if (normalized) {
                    if (chartData.length >= maxDataPoints) { chartData.shift(); }
                    chartData.push(normalized);
                }
            });
            console.log(`DEBUG: Datos iniciales de configuración para ${config.id} cargados en buffer local. Total: ${chartData.length}`);
        } else if (config.initialValue !== undefined) {
            const normalized = normalizeDataPoint(config.initialValue);
            if (normalized) {
                if (chartData.length >= maxDataPoints) { chartData.shift(); }
                chartData.push(normalized);
            }
            console.log(`DEBUG: Valor inicial de configuración para ${config.id} cargado en buffer local. Total: ${chartData.length}`);
        }

        return container;
    });

    console.log("ApexGraphWidget cargado y registrado en IOT_RENDERER.");
})();