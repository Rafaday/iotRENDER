#  Estructura de un Archivo JSON de Dashboard

Un archivo JSON de dashboard (`.json`) es un objeto raíz con las siguientes propiedades:

- **title** `(string, obligatorio)`: El título principal que se mostrará en la parte superior del dashboard.  
- **rows** `(array de objetos, obligatorio)`: Un array que define las filas del dashboard. Cada objeto de fila debe tener:

  - **id** `(string, obligatorio)`: Un identificador único para la fila.  
  - **columns** `(array de objetos, obligatorio)`: Un array que define las columnas dentro de esa fila. Cada objeto de columna debe tener:

    - **id** `(string, obligatorio)`: Un identificador único para la columna.  
    - **span** `(número, opcional)`: El ancho de la columna en el sistema de cuadrícula de Bootstrap (de 1 a 12). Si se omite, por defecto es 12 (ancho completo).  
    - **widgets** `(array de objetos, opcional)`: Un array de objetos, donde cada objeto es la configuración de un widget específico (ver la sección de Documentación de Widgets). Si la columna no tiene widgets, se mostrará un mensaje de "Columna vacía".  

---

## Ejemplo de Archivo JSON de Dashboard

Archivo: `dashboardConfig.json` o `Dashboards/miDashboard.json`

```json
{
    "title": "Mi Dashboard Principal",
    "rows": [
        {
            "id": "filaPrincipal",
            "columns": [
                {
                    "id": "columnaIzquierda",
                    "span": 6,
                    "widgets": [
                        {
                            "id": "miBoton",
                            "type": "ButtonWidget",
                            "label": "Accionar Algo",
                            "action": "activar",
                            "value": "1",
                            "variant": "primary"
                        },
                        {
                            "id": "miSlider",
                            "type": "SliderWidget",
                            "label": "Ajustar Nivel",
                            "action": "ajustarNivel",
                            "min": 0,
                            "max": 100,
                            "initialValue": 50
                        }
                    ]
                },
                {
                    "id": "columnaDerecha",
                    "span": 6,
                    "widgets": [
                        {
                            "id": "miLecturaTemp",
                            "type": "DisplayWidget",
                            "label": "Temperatura",
                            "unit": "°C",
                            "decimalPlaces": 2
                        },
                        {
                            "id": "abrirConfiguracion",
                            "type": "DashboardModalButtonWidget",
                            "label": "Configuración Avanzada",
                            "buttonText": "Abrir",
                            "modalTitle": "Ajustes del Sistema",
                            "dashboardJsonPath": "Dashboards/configDashboard.json",
                            "variant": "secondary"
                        }
                    ]
                }
            ]
        },
        {
            "id": "filaGrafico",
            "columns": [
                {
                    "id": "columnaGraficoCompleta",
                    "span": 12,
                    "widgets": [
                        {
                            "id": "graficoPrincipal",
                            "type": "ApexGraphWidget",
                            "label": "Historial de Datos",
                            "dataLabel": "Dato",
                            "unit": "Unidad",
                            "maxDataPoints": 60
                        }
                    ]
                }
            ]
        }
    ]
}
