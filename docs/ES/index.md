# Documentación de iotRENDER

Guía para configurar y crear dashboards en proyectos IoT con **Arduino**, **ESP32**, **Raspberry Pi** y otros dispositivos compatibles mediante **iotRENDER**.  

A continuación se detallan los pasos necesarios para crear y poner en marcha un proyecto:

---

## 1. Crear un Dashboard

Los dashboards de iotRENDER se definen mediante archivos **JSON**.  
Puedes crear un archivo principal `dashboard.json` y, si tu proyecto lo requiere, dashboards secundarios que contengan más widgets.  

- Los dashboards secundarios se guardan en la carpeta `Dashboards/`.  
- También puedes guardar en esa carpeta el dashboard principal, siempre que modifiques la ruta en `index.html` para que lo apunte correctamente.  

📌 Documentación relacionada:  
- 🔗 [Estructura de un archivo JSON de Dashboard](./Estructura-de-un-Archivo-JSON-de-Dashboard.md)  
- 🔗 [Documentación de Widgets](./widgets.md)  

---

## 2. Configuración del Frontend

Debes editar en `index.html`:  
- La **URL de tu servidor IoT**.  
- La **ruta de tu dashboard principal**.  
- Asegurarte de que los archivos necesarios estén disponibles.  

📌 Consulta:  
- 🔗 [Configuración del Frontend](./Configuración-del-Frontend.md)  

---

## 3. Puesta en marcha

iotRENDER necesita un servidor para funcionar.  
Puedes iniciar un servidor HTTP local en **Python** de la siguiente manera:

1. Abre una terminal y navega a la raíz del proyecto.  
2. Inicia el servidor en el puerto 8000:  
   ```bash
   python -m http.server 8000


 