### Frontend Configuration (HTML/JS)

1. **`index.html`**:  
   * Open `index.html`.  
   * Set the constant `WEBSOCKET_URL` to point to the IP address of your IoT server.  
     * For ESP32:  
       ```js
       const WEBSOCKET_URL = 'ws://YOUR_ESP32_IP_ADDRESS/ws';
       ```
   * Make sure the constant `MAIN_DASHBOARD_CONFIG_PATH` points to `dashboardConfig.json`. This is the main dashboard of your project. If you created a different one, update the path accordingly.  

2. **`dashboardConfig.json`**:  
   * Create or edit this file in the root of your project. This file contains the full definition of your main dashboard.  
   * Refer to the dashboard documentation for guidance on how to structure your dashboards.  

3. **`Dashboards/miniDashboard1.json`**:  
   * If needed, create or edit this file inside the `Dashboards/` folder.  
   * This is an example of a dashboard that will be loaded inside a modal. Adapt its content to your requirements.  
   * You can create as many secondary dashboards as needed. Check the Widgets documentation for details on how to use buttons that load these dashboards.  

4. **Widget Files (`js/widgets/loadWidgets.js`)**:  
   * Ensure that all the widgets you plan to use in your project — especially custom ones — are included in this file.  

   ```js
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
           'DashboardModalButtonWidget.js', // <--- NEW WIDGET ADDED HERE!
       ],
       ... (rest of the code)
   }
