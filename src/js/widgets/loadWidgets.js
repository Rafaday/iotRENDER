// js/widgets/loadWidgets.js

const WIDGET_LOADER = {
    widgetFiles: [
        'ButtonWidget.js', 
        'TextInputWidget.js',
        'SliderWidget.js',
        'LedWidget.js',    
        'CircularDisplayWidget.js',
        'SwitchWidget.js', 
        'ApexGraphWidget.js', 
        'DisplayWidget.js', 
        'DashboardModalButtonWidget.js', // <--- ¡AÑADIDO EL NUEVO WIDGET AQUÍ!
    ],
    
    basePath: 'js/widgets/',

    loadAllWidgets: function() {
        console.log('Iniciando carga dinámica de widgets...');
        const scriptPromises = this.widgetFiles.map(fileName => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = this.basePath + fileName;
                script.async = true; 
                
                script.onload = () => {
                    console.log(`Widget '${fileName}' cargado correctamente.`);
                    resolve();
                };
                
                script.onerror = () => {
                    console.error(`ERROR: Fallo al cargar el script del widget: ${fileName}. Verifica la ruta y el nombre del archivo.`);
                    reject(new Error(`Fallo al cargar el script: ${fileName}`));
                };
                
                document.head.appendChild(script);
            });
        });

        return Promise.all(scriptPromises)
            .then(() => console.log('Todos los widgets cargados por WIDGET_LOADER.'))
            .catch(error => {
                console.error('Uno o más widgets fallaron al cargar durante WIDGET_LOADER:', error);
                throw error;
            });
    }
};