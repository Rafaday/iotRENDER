### Configuración del Frontend (HTML/JS)

1.  **`index.html`**:
    *   Abre `index.html`.
    *   Ajusta la constante `WEBSOCKET_URL` para que apunte a la dirección IP de tu servidor IoT.
        *   Para ESP32: `const WEBSOCKET_URL = 'ws://TU_DIRECCION_IP_DEL_ESP32/ws';`
        
    *   Verifica que la constante `MAIN_DASHBOARD_CONFIG_PATH` apunte a `dashboardConfig.json`. Este es el dashboard principal de tu proyecto. Si has creado otro, apunta a ese.  

2.  **`dashboardConfig.json`**:
    *   Crea o edita este archivo en la raíz de tu proyecto. Este archivo contendrá la definición completa de tu dashboard principal. Consulta la documentación sobre dashboards para crear tus dashboards. 
    
3.  **`Dashboards/miniDashboard1.json`**:
    *  Si lo necesitas, crea o edita este archivo en la carpeta `Dashboards/`. Este es un ejemplo de un dashboard que se cargará dentro de un modal. Adapta su contenido según tus necesidades. Puedes crear todos los dashboards secundarios que necesies. Consulta la documentación sobre Widgets para usar botones que llamen a estos dashboards. 

4.  **Archivos de Widgets (`js/widgets/loadWidgets.js*.js`) `**:
    *  Asegurate de que todos los widgets que vas a usar en tu proyecto, en especial si has creado uno tu, están inclidos en este archivo. 

   ```
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
    ... (resto de código)
}
   ```
