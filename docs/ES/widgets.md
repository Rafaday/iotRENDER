
---

# Documentación de Widgets para Dashboard IoT Configurable

Este documento detalla la configuración de cada widget utilizado en el Dashboard IoT, así como su interacción con el servidor IoT (ESP32, Raspberry Pi, Arduino...) a través de WebSockets.

La comunicación se basa en mensajes JSON.
*   El **servidor IoT** envía mensajes para **actualizar** el dashboard: `{"widgetId": "ID_DEL_WIDGET", "status": "VALOR_DE_ESTADO"}`.
*   El **dashboard** envía mensajes para **controlar** el servidor IoT: `{"widgetId": "ID_DEL_WIDGET", "action": "ACCION", "value": "VALOR"}`.

---

## 1. `ButtonWidget`

Representa un botón interactivo que, al ser presionado, envía un comando específico al servidor IoT.

*   **`type`**: `"ButtonWidget"`
*   **Envía al servidor IoT:**
    ```json
    {
      "widgetId": "ID_DEL_WIDGET",
      "action": "acción_definida_en_json",
      "value": "valor_definido_en_json"
    }
    ```
*   **Recibe del servidor IoT:** No está diseñado para recibir actualizaciones de estado directamente.

### Configuración JSON:

| Propiedad  | Tipo     | Obligatorio | Descripción                                                          | Ejemplo de Valor             |
| :---------- | :------- | :---------- | :------------------------------------------------------------------- | :--------------------------- |
| `id`        | `string` | Sí          | Identificador único del widget en el dashboard.                      | `"ledOnBtn"`                 |
| `type`      | `string` | Sí          | Tipo de widget. Siempre `"ButtonWidget"`.                            | `"ButtonWidget"`             |
| `label`     | `string` | Sí          | Texto principal que se muestra sobre el botón.                       | `"Encender LED"`             |
| `action`    | `string` | Sí          | La acción que el servidor IoT debe realizar.                         | `"toggleLED"`                |
| `value`     | `string` | Sí          | El valor asociado a la acción (ej. "ON", "OFF", "REBOOT").          | `"ON"`                       |
| `variant`   | `string` | No          | Estilo visual del botón (clase de Bootstrap, ej. `primary`, `success`). Por defecto: `primary`. | `"success"`                  |

---

## 2. `TextInputWidget`

Proporciona un campo de entrada (texto o numérico) y un botón para enviar el valor introducido por el usuario al servidor IoT.

*   **`type`**: `"TextInputWidget"`
*   **Envía al servidor IoT:**
    ```json
    {
      "widgetId": "ID_DEL_WIDGET",
      "action": "acción_definida",
      "value": "valor_introducido_por_usuario"
    }
    ```
*   **Recibe del servidor IoT:** No está diseñado para recibir actualizaciones de estado directamente.

### Configuración JSON:

| Propiedad         | Tipo      | Obligatorio | Descripción                                                                | Ejemplo de Valor                   |
| :---------------- | :-------- | :---------- | :------------------------------------------------------------------------- | :--------------------------------- |
| `id`              | `string`  | Sí          | Identificador único del widget.                                            | `"messageSender"`                  |
| `type`            | `string`  | Sí          | Tipo de widget. Siempre `"TextInputWidget"`.                               | `"TextInputWidget"`                |
| `label`           | `string`  | Sí          | Texto principal que se muestra sobre el widget.                            | `"Enviar Mensaje Personalizado"`   |
| `inputLabel`      | `string`  | No          | Etiqueta del campo de entrada. Por defecto: "Valor Numérico" o "Texto a Enviar". | `"Mensaje:"`                       |
| `action`          | `string`  | Sí          | La acción que el servidor IoT debe realizar con el valor.                  | `"customMessage"`, `"setValue"`    |
| `inputType`       | `string`  | No          | Tipo del campo de entrada (`text`, `number`). Por defecto: `text`.         | `"number"`                         |
| `placeholder`     | `string`  | No          | Texto de marcador de posición en el campo de entrada.                       | `"Hola Arduino!"`                  |
| `sendButtonLabel` | `string`  | No          | Texto del botón de envío. Por defecto: "Enviar".                           | `"Enviar Texto"`                   |
| `variant`         | `string`  | No          | Estilo visual del botón (clase de Bootstrap). Por defecto: `info`.         | `"primary"`                        |
| `clearOnSend`     | `boolean` | No          | Si `true`, el campo se vacía después de enviar. Por defecto: `false`.      | `true`                             |
| `min`             | `number`  | No          | Valor mínimo si `inputType` es `number`.                                   | `0`                                |
| `max`             | `number`  | No          | Valor máximo si `inputType` es `number`.                                   | `100`                              |
| `step`            | `number`  | No          | Incremento si `inputType` es `number`.                                     | `0.5`                              |

---

## 3. `SliderWidget`

Permite seleccionar un valor numérico dentro de un rango mediante un control deslizante. El valor se envía al servidor IoT de forma continua con un "debounce" (al arrastrar) y se puede actualizar desde el servidor.

*   **`type`**: `"SliderWidget"`
*   **Envía al servidor IoT:**
    ```json
    {
      "widgetId": "ID_DEL_WIDGET",
      "action": "acción_definida",
      "value": valor_actual_del_slider (número)
    }
    ```
*   **Recibe del servidor IoT:**
    ```json
    {
      "widgetId": "ID_DEL_WIDGET",
      "status": nuevo_valor_del_slider (número)
    }
    ```
    El slider se ajustará para mostrar el `nuevo_valor_del_slider`.

### Configuración JSON:

| Propiedad          | Tipo     | Obligatorio | Descripción                                                                | Ejemplo de Valor                   |
| :----------------- | :------- | :---------- | :------------------------------------------------------------------------- | :--------------------------------- |
| `id`               | `string` | Sí          | Identificador único del widget.                                            | `"volumeControl"`                  |
| `type`             | `string` | Sí          | Tipo de widget. Siempre `"SliderWidget"`.                                  | `"SliderWidget"`                   |
| `label`            | `string` | Sí          | Texto principal que se muestra sobre el widget.                            | `"Control de Volumen"`             |
| `inputLabel`       | `string` | No          | Etiqueta para el valor actual del slider. Por defecto: "Valor:".           | `"Intensidad:"`                    |
| `action`           | `string` | Sí          | La acción que el servidor IoT debe realizar.                               | `"setVolume"`, `"setPwmValue"`     |
| `min`              | `number` | No          | Valor mínimo del slider. Por defecto: `0`.                                 | `0`                                |
| `max`              | `number` | No          | Valor máximo del slider. Por defecto: `100`.                               | `255`                              |
| `step`             | `number` | No          | Incremento/decremento del slider. Por defecto: `1`.                        | `1`                                |
| `initialValue`     | `number` | No          | **¡Importante!** Si se omite, el slider empezará en `min` (0) y **esperará el valor real del servidor IoT** para sincronizarse. Si está presente, el slider usa este valor inicial hasta recibir una actualización del servidor. | `128`                              |
| `debounceTime`     | `number` | No          | Tiempo en milisegundos para el "debounce" del envío por `oninput`. El valor se envía cuando el usuario deja de arrastrar por este tiempo. Por defecto: `50`ms. | `100`                              |

---

## 4. `LedWidget`

Muestra el estado de un LED (encendido/apagado) de forma visual. Se actualiza mediante mensajes del servidor IoT.

*   **`type`**: `"LedWidget"`
*   **Envía al servidor IoT:** No envía comandos directamente.
*   **Recibe del servidor IoT:**
    ```json
    {
      "widgetId": "ID_DEL_WIDGET",
      "status": "ON" | "OFF" | true | false
    }
    ```
    El LED se encenderá/apagará según el `status` recibido.

### Configuración JSON:

| Propiedad       | Tipo     | Obligatorio | Descripción                                                          | Ejemplo de Valor                   |
| :-------------- | :------- | :---------- | :------------------------------------------------------------------- | :--------------------------------- |
| `id`            | `string` | Sí          | Identificador único del widget.                                      | `"statusLedSistema"`               |
| `type`          | `string` | Sí          | Tipo de widget. Siempre `"LedWidget"`.                               | `"LedWidget"`                      |
| `label`         | `string` | Sí          | Texto principal que se muestra sobre el widget.                      | `"LED del Sistema"`                |
| `initialState`  | `string` | No          | Estado inicial del LED (`"ON"` o `"OFF"`). Si se omite, por defecto: `"OFF"`. | `"OFF"`                            |
| `onColorClass`  | `string` | No          | Clase CSS de Bootstrap para el color cuando está encendido. Por defecto: `bg-success`. | `"bg-danger"`                      |
| `offColorClass` | `string` | No          | Clase CSS de Bootstrap para el color cuando está apagado. Por defecto: `bg-secondary`. | `"bg-warning"`                     |
| `onText`        | `string` | No          | Texto a mostrar cuando está encendido. Por defecto: "ENCENDIDO".     | `"ACTIVO"`                         |
| `offText`       | `string` | No          | Texto a mostrar cuando está apagado. Por defecto: "APAGADO".         | `"INACTIVO"`                       |

---

## 5. `CircularDisplayWidget`

Muestra un valor de porcentaje dentro de un rango (0-100) utilizando un gráfico circular progresivo.

*   **`type`**: `"CircularDisplayWidget"`
*   **Envía al servidor IoT:** No envía comandos directamente.
*   **Recibe del servidor IoT:**
    ```json
    {
      "widgetId": "ID_DEL_WIDGET",
      "status": valor_porcentual (número entre 0 y 100)
    }
    ```
    El gráfico circular se actualizará con el `valor_porcentual` recibido.

### Configuración JSON:

| Propiedad       | Tipo     | Obligatorio | Descripción                                                          | Ejemplo de Valor             |
| :-------------- | :------- | :---------- | :------------------------------------------------------------------- | :--------------------------- |
| `id`            | `string` | Sí          | Identificador único del widget.                                      | `"batteryLevel"`             |
| `type`          | `string` | Sí          | Tipo de widget. Siempre `"CircularDisplayWidget"`.                   | `"CircularDisplayWidget"`    |
| `label`         | `string` | Sí          | Texto principal que se muestra sobre el widget.                      | `"Nivel de Batería"`         |
| `initialValue`  | `number` | No          | Valor de porcentaje inicial. Si se omite, empieza en `0` y espera el valor real del servidor IoT. | `75`                         |
| `size`          | `number` | No          | Tamaño del SVG en píxeles. Por defecto: `120`.                       | `150`                        |
| `strokeWidth`   | `number` | No          | Grosor de la línea del círculo. Por defecto: `10`.                   | `15`                         |
| `bgColor`       | `string` | No          | Color del fondo del círculo (formato CSS). Por defecto: `#e0e0e0`.   | `"#e0e0e0"`                  |
| `progressColor` | `string` | No          | Color del progreso del círculo. Por defecto: `#007bff`.             | `"#28a745"`                  |

---

## 6. `SwitchWidget`

Un interruptor de tipo "toggle" que representa un estado ON/OFF del sistema. Envía comandos al servidor y espera una confirmación, revirtiendo su estado si no la recibe a tiempo.

*   **`type`**: `"SwitchWidget"`
*   **Envía al servidor IoT:**
    ```json
    {
      "widgetId": "ID_DEL_WIDGET",
      "action": "acción_definida",
      "value": "valor_ON_definido" | "valor_OFF_definido"
    }
    ```
*   **Recibe del servidor IoT:**
    ```json
    {
      "widgetId": "ID_DEL_WIDGET",
      "status": "valor_ON_definido" | "valor_OFF_definido" | true | false
    }
    ```
    El switch se actualizará a este estado. Si el widget estaba esperando una confirmación, la validará con este mensaje.

### Configuración JSON:

| Propiedad            | Tipo     | Obligatorio | Descripción                                                                | Ejemplo de Valor                   |
| :------------------- | :------- | :---------- | :------------------------------------------------------------------------- | :--------------------------------- |
| `id`                 | `string` | Sí          | Identificador único del widget.                                            | `"powerSwitch"`                    |
| `type`               | `string` | Sí          | Tipo de widget. Siempre `"SwitchWidget"`.                                  | `"SwitchWidget"`                   |
| `label`              | `string` | Sí          | Texto principal que se muestra sobre el widget.                            | `"Estado del Sistema"`             |
| `initialState`       | `string` | No          | Estado inicial del switch (`"ON"` o `"OFF"`). Si se omite, por defecto: `"OFF"`. | `"OFF"`                            |
| `onText`             | `string` | No          | Texto a mostrar cuando está en estado "ON". Por defecto: "ENCENDIDO".      | `"SISTEMA ACTIVO"`                 |
| `offText`            | `string` | No          | Texto a mostrar cuando está en estado "OFF". Por defecto: "APAGADO".       | `"SISTEMA INACTIVO"`               |
| `pendingText`        | `string` | No          | Texto a mostrar mientras se espera la confirmación del servidor. Por defecto: "PENDIENTE...". | `"APLICANDO CAMBIO..."`            |
| `onValue`            | `string` | Sí          | Valor a enviar y esperar del servidor cuando el switch está "ON".          | `"START"`                          |
| `offValue`           | `string` | Sí          | Valor a enviar y esperar del servidor cuando el switch está "OFF".         | `"STOP"`                           |
| `action`             | `string` | Sí          | La acción que el servidor IoT debe realizar.                               | `"systemPower"`, `"toggleMotor"`   |
| `confirmationTimeout`| `number` | No          | Tiempo en milisegundos para esperar una confirmación del servidor antes de revertir el estado. Por defecto: `3000`ms. | `5000`                             |

---

## 7. `ApexGraphWidget`

Muestra la evolución de un dato numérico a lo largo del tiempo utilizando la librería ApexCharts.

*   **`type`**: `"ApexGraphWidget"`
*   **Envía al servidor IoT:** No envía comandos directamente.
*   **Recibe del servidor IoT:**
    ```json
    {
      "widgetId": "ID_DEL_WIDGET",
      "status": {
        "value": valor_numerico,
        "timestamp": marca_de_tiempo_unix_en_ms (opcional, si se omite usa Date.now())
      }
    }
    ```
    O simplificado (el widget usará `Date.now()` para el timestamp):
    ```json
    {
      "widgetId": "ID_DEL_WIDGET",
      "status": valor_numerico
    }
    ```
    El gráfico añadirá este punto de datos y se actualizará.

### Configuración JSON:

| Propiedad               | Tipo     | Obligatorio | Descripción                                                          | Ejemplo de Valor                   |
| :---------------------- | :------- | :---------- | :------------------------------------------------------------------- | :--------------------------------- |
| `id`                    | `string` | Sí          | Identificador único del widget.                                      | `"adcGraph"`                       |
| `type`                  | `string` | Sí          | Tipo de widget. Siempre `"ApexGraphWidget"`.                         | `"ApexGraphWidget"`                |
| `label`                 | `string` | Sí          | Título principal del gráfico.                                        | `"Evolución Lectura ADC"`          |
| `dataLabel`             | `string` | No          | Etiqueta de la serie de datos en la leyenda y el tooltip. Por defecto: "Valor". | `"ADC Value"`                      |
| `unit`                  | `string` | No          | Unidad principal para el eje Y (texto en el título del eje).         | `"mV"`                             |
| `unitSuffix`            | `string` | No          | Sufijo para mostrar junto a los valores en el eje Y y tooltip. Ej: " W". | `" mV"`                            |
| `maxDataPoints`         | `number` | No          | Número máximo de puntos de datos a mantener en el gráfico. Si se excede, el más antiguo se elimina. Por defecto: `30`. | `200`                              |
| `canvasHeight`          | `number` | No          | Altura del área del gráfico en píxeles. Por defecto: `250`.          | `300`                              |
| `borderColor`           | `string` | No          | Color de la línea del gráfico (formato CSS). Por defecto: `#007bff`. | `"#17a2b8"`                        |
| `backgroundColor`       | `string` | No          | Color de fondo del área bajo la línea (formato CSS, acepta `rgba`). Por defecto: `rgba(0, 123, 255, 0.5)`. | `"rgba(23, 162, 184, 0.2)"`        |
| `fillType`              | `string` | No          | Tipo de relleno bajo la línea (`solid`, `gradient`). Por defecto: `gradient`. | `"gradient"`                       |
| `curve`                 | `string` | No          | Estilo de la curva de la línea (`smooth`, `straight`, `stepline`). Por defecto: `smooth`. | `"smooth"`                         |
| `animationSpeed`        | `number` | No          | Velocidad de la animación para nuevos puntos en milisegundos. Por defecto: `1000`. | `600`                              |
| `timeRange`             | `number` | No          | Rango de tiempo visible en el eje X en milisegundos. Si se omite, se calcula con `maxDataPoints * updateInterval`. | `40000`                            |
| `updateInterval`        | `number` | No          | Intervalo de tiempo esperado entre actualizaciones de datos en milisegundos. Usado para calcular `timeRange`. Por defecto: `1000`. | `200`                              |
| `yAxisDecimalPlaces`    | `number` | No          | Número de decimales a mostrar en las etiquetas del eje Y. Por defecto: `0`. | `0`                                |
| `tooltipDecimalPlaces`  | `number` | No          | Número de decimales a mostrar en el tooltip. Por defecto: `2`.       | `0`                                |
| `minY`                  | `number` | No          | Valor mínimo fijo para el eje Y. Si se omite, auto-escala.           | `0`                                |
| `maxY`                  | `number` | No          | Valor máximo fijo para el eje Y. Si se omite, auto-escala.           | `4095`                             |
| `chartType`             | `string` | No          | Tipo de gráfico (`line`, `bar`, `area`). Por defecto: `line`.        | `"line"`                           |
| `animationsEnabled`     | `boolean`| No          | Habilitar/deshabilitar animaciones. Por defecto: `true`.             | `true`                             |
| `toolbarShow`           | `boolean`| No          | Mostrar/ocultar la barra de herramientas del gráfico. Por defecto: `false`. | `false`                            |
| `markerSize`            | `number` | No          | Tamaño de los marcadores de puntos. Por defecto: `0` (ocultos).      | `0`                                |
| `gridColor`             | `string` | No          | Color de las líneas de la cuadrícula. Por defecto: `#e7e7e7`.         | `"#e7e7e7"`                        |
| `showLegend`            | `boolean`| No          | Mostrar/ocultar la leyenda del gráfico. Por defecto: `false`.        | `false`                            |

---

## 8. `DisplayWidget`

Muestra un valor numérico simple recibido del servidor IoT, con una etiqueta y una unidad configurable.

*   **`type`**: `"DisplayWidget"`
*   **Envía al servidor IoT:** No envía comandos directamente.
*   **Recibe del servidor IoT:**
    ```json
    {
      "widgetId": "ID_DEL_WIDGET",
      "status": valor_numerico | "N/A" (o cualquier string)
    }
    ```
    El display se actualizará con el valor recibido.

### Configuración JSON:

| Propiedad       | Tipo     | Obligatorio | Descripción                                                          | Ejemplo de Valor             |
| :-------------- | :------- | :---------- | :------------------------------------------------------------------- | :--------------------------- |
| `id`            | `string` | Sí          | Identificador único del widget.                                      | `"currentTemperature"`       |
| `type`          | `string` | Sí          | Tipo de widget. Siempre `"DisplayWidget"`.                           | `"DisplayWidget"`            |
| `label`         | `string` | Sí          | Título principal del display.                                        | `"Temperatura Actual"`       |
| `unit`          | `string` | No          | Unidad a mostrar junto al valor (ej. "°C", "V", "A").                | `"°C"`                       |
| `decimalPlaces` | `number` | No          | Número de decimales a mostrar para el valor. Por defecto: `2`.       | `1`                          |
| `initialValue`  | `number` | No          | Valor inicial a mostrar. Si se omite, muestra `defaultValue`. Por defecto: `"N/A"`. | `23.5`                       |
| `defaultValue`  | `string` | No          | Texto a mostrar si el valor recibido no es numérico. Por defecto: `"N/A"`. | `"No data"`                  |

---

## 9. `DashboardModalButtonWidget`

Un botón que, al ser presionado, abre un modal de Bootstrap y renderiza un dashboard secundario configurable (cargado desde un archivo JSON) dentro de ese modal.

*   **`type`**: `"DashboardModalButtonWidget"`
*   **Envía al servidor IoT:** No envía comandos directamente. Los widgets dentro del modal se comunicarán con el servidor de forma estándar.
*   **Recibe del servidor IoT:** No recibe actualizaciones de estado para sí mismo. (Los widgets dentro del modal sí recibirán y se actualizarán).

### Configuración JSON:

| Propiedad         | Tipo     | Obligatorio | Descripción                                                          | Ejemplo de Valor                   |
| :---------------- | :------- | :---------- | :------------------------------------------------------------------- | :--------------------------------- |
| `id`              | `string` | Sí          | Identificador único del widget.                                      | `"motorControlModalBtn"`           |
| `type`            | `string` | Sí          | Tipo de widget. Siempre `"DashboardModalButtonWidget"`.              | `"DashboardModalButtonWidget"`     |
| `label`           | `string` | Sí          | Texto principal que se muestra sobre el botón.                       | `"Control de Motor Avanzado"`      |
| `buttonText`      | `string` | No          | Texto que aparecerá en el botón. Por defecto: "Ver Detalles".        | `"Abrir Control de Motor"`         |
| `modalTitle`      | `string` | No          | Título que aparecerá en la cabecera del modal. Por defecto: el mismo `label` del widget. | `"Panel de Control de Motor"`      |
| `dashboardJsonPath`| `string` | Sí          | Ruta al archivo JSON que define el dashboard secundario a cargar en el modal. | `"Dashboards/miniDashboard1.json"` |
| `variant`         | `string` | No          | Estilo visual del botón (clase de Bootstrap). Por defecto: `primary`. | `"info"`                           |