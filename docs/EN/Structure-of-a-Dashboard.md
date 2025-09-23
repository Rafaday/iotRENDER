# Structure of a Dashboard JSON File

A dashboard JSON file (`.json`) is a root object with the following properties:

- **title** `(string, required)`: The main title displayed at the top of the dashboard.  
- **rows** `(array of objects, required)`: An array defining the rows of the dashboard. Each row object must contain:

  - **id** `(string, required)`: A unique identifier for the row.  
  - **columns** `(array of objects, required)`: An array defining the columns within that row. Each column object must contain:

    - **id** `(string, required)`: A unique identifier for the column.  
    - **span** `(number, optional)`: The column width in the Bootstrap grid system (from 1 to 12). Defaults to 12 (full width) if omitted.  
    - **widgets** `(array of objects, optional)`: An array of objects, where each object defines the configuration of a specific widget (see the Widgets Documentation section).  
      If the column has no widgets, a message such as *"Empty column"* will be displayed.  

---

## Example of a Dashboard JSON File

File: `dashboardConfig.json` or `Dashboards/myDashboard.json`

```json
{
    "title": "My Main Dashboard",
    "rows": [
        {
            "id": "mainRow",
            "columns": [
                {
                    "id": "leftColumn",
                    "span": 6,
                    "widgets": [
                        {
                            "id": "myButton",
                            "type": "ButtonWidget",
                            "label": "Trigger Action",
                            "action": "activate",
                            "value": "1",
                            "variant": "primary"
                        },
                        {
                            "id": "mySlider",
                            "type": "SliderWidget",
                            "label": "Adjust Level",
                            "action": "setLevel",
                            "min": 0,
                            "max": 100,
                            "initialValue": 50
                        }
                    ]
                },
                {
                    "id": "rightColumn",
                    "span": 6,
                    "widgets": [
                        {
                            "id": "tempReading",
                            "type": "DisplayWidget",
                            "label": "Temperature",
                            "unit": "°C",
                            "decimalPlaces": 2
                        },
                        {
                            "id": "openSettings",
                            "type": "DashboardModalButtonWidget",
                            "label": "Advanced Settings",
                            "buttonText": "Open",
                            "modalTitle": "System Settings",
                            "dashboardJsonPath": "Dashboards/configDashboard.json",
                            "variant": "secondary"
                        }
                    ]
                }
            ]
        },
        {
            "id": "graphRow",
            "columns": [
                {
                    "id": "fullGraphColumn",
                    "span": 12,
                    "widgets": [
                        {
                            "id": "mainGraph",
                            "type": "ApexGraphWidget",
                            "label": "Data History",
                            "dataLabel": "Value",
                            "unit": "Unit",
                            "maxDataPoints": 60
                        }
                    ]
                }
            ]
        }
    ]
}
