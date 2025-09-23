# Widgets Documentation for Configurable IoT Dashboard

This document details the configuration of each widget used in the IoT Dashboard, as well as its interaction with the IoT server (ESP32, Raspberry Pi, Arduino, or a Python simulator) via WebSockets.

Communication is based on JSON messages:
*   The **IoT server** sends messages to **update** the dashboard:  
    `{"widgetId": "WIDGET_ID", "status": "STATUS_VALUE"}`
*   The **dashboard** sends messages to **control** the IoT server:  
    `{"widgetId": "WIDGET_ID", "action": "ACTION", "value": "VALUE"}`

---

## 1. `ButtonWidget`

Represents an interactive button that, when pressed, sends a specific command to the IoT server.

*   **`type`**: `"ButtonWidget"`
*   **Sends to IoT server:**
    ```json
    {
      "widgetId": "WIDGET_ID",
      "action": "action_defined_in_json",
      "value": "value_defined_in_json"
    }
    ```
*   **Receives from IoT server:** Not designed to receive state updates directly.

### JSON Configuration:

| Property   | Type     | Required | Description                                                                 | Example Value             |
| :--------- | :------- | :--------| :-------------------------------------------------------------------------- | :------------------------ |
| `id`       | `string` | Yes      | Unique identifier of the widget in the dashboard.                           | `"ledOnBtn"`              |
| `type`     | `string` | Yes      | Widget type. Always `"ButtonWidget"`.                                       | `"ButtonWidget"`          |
| `label`    | `string` | Yes      | Main text displayed on the button.                                          | `"Turn On LED"`           |
| `action`   | `string` | Yes      | The action the IoT server should perform.                                   | `"toggleLED"`             |
| `value`    | `string` | Yes      | Value associated with the action (e.g., `"ON"`, `"OFF"`, `"REBOOT"`).       | `"ON"`                    |
| `variant`  | `string` | No       | Visual style of the button (Bootstrap class, e.g., `primary`, `success`). Default: `primary`. | `"success"` |

---

## 2. `TextInputWidget`

Provides an input field (text or numeric) and a button to send the value entered by the user to the IoT server.

*   **`type`**: `"TextInputWidget"`
*   **Sends to IoT server:**
    ```json
    {
      "widgetId": "WIDGET_ID",
      "action": "defined_action",
      "value": "user_entered_value"
    }
    ```
*   **Receives from IoT server:** Not designed to receive state updates directly.

### JSON Configuration:

| Property         | Type      | Required | Description                                                                | Example Value                |
| :--------------- | :-------- | :--------| :------------------------------------------------------------------------- | :--------------------------- |
| `id`             | `string`  | Yes      | Unique identifier of the widget.                                           | `"messageSender"`            |
| `type`           | `string`  | Yes      | Widget type. Always `"TextInputWidget"`.                                   | `"TextInputWidget"`          |
| `label`          | `string`  | Yes      | Main text displayed above the widget.                                      | `"Send Custom Message"`      |
| `inputLabel`     | `string`  | No       | Label for the input field. Default: `"Numeric Value"` or `"Text to Send"`. | `"Message:"`                 |
| `action`         | `string`  | Yes      | Action that the IoT server should perform with the value.                  | `"customMessage"`, `"setValue"` |
| `inputType`      | `string`  | No       | Input field type (`text`, `number`). Default: `text`.                      | `"number"`                   |
| `placeholder`    | `string`  | No       | Placeholder text for the input field.                                      | `"Hello Arduino!"`           |
| `sendButtonLabel`| `string`  | No       | Text for the send button. Default: `"Send"`.                               | `"Send Text"`                |
| `variant`        | `string`  | No       | Visual style of the button (Bootstrap class). Default: `info`.             | `"primary"`                  |
| `clearOnSend`    | `boolean` | No       | If `true`, clears the input after sending. Default: `false`.               | `true`                       |
| `min`            | `number`  | No       | Minimum value if `inputType` is `number`.                                  | `0`                          |
| `max`            | `number`  | No       | Maximum value if `inputType` is `number`.                                  | `100`                        |
| `step`           | `number`  | No       | Step increment if `inputType` is `number`.                                 | `0.5`                        |

---

## 3. `SliderWidget`

Allows selecting a numeric value within a range using a slider. The value is continuously sent to the IoT server with a debounce while dragging, and it can also be updated from the server.

*   **`type`**: `"SliderWidget"`
*   **Sends to IoT server:**
    ```json
    {
      "widgetId": "WIDGET_ID",
      "action": "defined_action",
      "value": current_slider_value
    }
    ```
*   **Receives from IoT server:**
    ```json
    {
      "widgetId": "WIDGET_ID",
      "status": new_slider_value
    }
    ```
    The slider will update to reflect `new_slider_value`.

### JSON Configuration:

| Property   | Type     | Required | Description                                                     | Example Value      |
| :--------- | :------- | :--------| :-------------------------------------------------------------- | :---------------- |
| `id`       | `string` | Yes      | Unique identifier of the widget.                                | `"tempControl"`   |
| `type`     | `string` | Yes      | Widget type. Always `"SliderWidget"`.                           | `"SliderWidget"`  |
| `label`    | `string` | Yes      | Text displayed above the slider.                                | `"Set Temperature"`|
| `action`   | `string` | Yes      | Action to send to the IoT server.                               | `"setTemp"`       |
| `min`      | `number` | Yes      | Minimum value.                                                  | `0`               |
| `max`      | `number` | Yes      | Maximum value.                                                  | `100`             |
| `step`     | `number` | No       | Step size. Default: 1.                                          | `5`               |
| `unit`     | `string` | No       | Measurement unit displayed next to the value.                   | `"°C"`            |

---

## 4. `LedWidget`

Visually represents the state of an LED (on/off). It updates based on messages from the IoT server.

*   **`type`**: `"LedWidget"`
*   **Sends to IoT server:** Does not send commands directly.
*   **Receives from IoT server:**
    ```json
    {
      "widgetId": "WIDGET_ID",
      "status": "ON" | "OFF" | true | false
    }
    ```

### JSON Configuration:

| Property   | Type     | Required | Description                                      | Example Value |
| :--------- | :------- | :--------| :----------------------------------------------- | :------------ |
| `id`       | `string` | Yes      | Unique identifier of the widget.                 | `"ledStatus"` |
| `type`     | `string` | Yes      | Widget type. Always `"LedWidget"`.               | `"LedWidget"` |
| `label`    | `string` | Yes      | Text displayed next to the LED indicator.        | `"LED State"` |
| `colorOn`  | `string` | No       | Color when ON. Default: `"green"`.               | `"lime"`      |
| `colorOff` | `string` | No       | Color when OFF. Default: `"red"`.                | `"gray"`      |

---

## 5. `CircularDisplayWidget`

Displays a percentage value (0–100) as a circular progress chart.

*   **`type`**: `"CircularDisplayWidget"`
*   **Sends to IoT server:** None.
*   **Receives from IoT server:**
    ```json
    {
      "widgetId": "WIDGET_ID",
      "status": percentage_value
    }
    ```

### JSON Configuration:

| Property   | Type     | Required | Description                                  | Example Value  |
| :--------- | :------- | :--------| :------------------------------------------- | :------------- |
| `id`       | `string` | Yes      | Unique identifier.                           | `"battery"`    |
| `type`     | `string` | Yes      | Widget type. Always `"CircularDisplayWidget"`. | `"CircularDisplayWidget"` |
| `label`    | `string` | Yes      | Label displayed below the circle.            | `"Battery"`    |
| `unit`     | `string` | No       | Measurement unit.                            | `"%"`          |
| `color`    | `string` | No       | Chart color.                                 | `"blue"`       |

---

## 6. `SwitchWidget`

A toggle switch representing an ON/OFF state. It sends commands to the IoT server and waits for confirmation, reverting its state if no confirmation is received in time.

*   **`type`**: `"SwitchWidget"`
*   **Sends to IoT server:**
    ```json
    {
      "widgetId": "WIDGET_ID",
      "action": "defined_action",
      "value": true | false
    }
    ```
*   **Receives from IoT server:**
    ```json
    {
      "widgetId": "WIDGET_ID",
      "status": true | false
    }
    ```

### JSON Configuration:

| Property   | Type     | Required | Description                              | Example Value   |
| :--------- | :------- | :--------| :--------------------------------------- | :-------------- |
| `id`       | `string` | Yes      | Unique identifier.                       | `"mainSwitch"`  |
| `type`     | `string` | Yes      | Widget type. Always `"SwitchWidget"`.    | `"SwitchWidget"`|
| `label`    | `string` | Yes      | Text displayed next to the switch.       | `"Power"`       |
| `action`   | `string` | Yes      | Action to send.                          | `"togglePower"` |

---

## 7. `ApexGraphWidget`

Displays the evolution of a numeric value over time using the ApexCharts library.  

*   **`type`**: `"ApexGraphWidget"`
*   **Sends to IoT server:** None.
*   **Receives from IoT server:**
    ```json
    {
      "widgetId": "WIDGET_ID",
      "status": numeric_value
    }
    ```

### JSON Configuration:

| Property   | Type     | Required | Description                                         | Example Value      |
| :--------- | :------- | :--------| :-------------------------------------------------- | :---------------- |
| `id`       | `string` | Yes      | Unique identifier.                                  | `"tempGraph"`     |
| `type`     | `string` | Yes      | Widget type. Always `"ApexGraphWidget"`.            | `"ApexGraphWidget"`|
| `label`    | `string` | Yes      | Chart title.                                       | `"Temperature"`   |
| `unit`     | `string` | No       | Measurement unit.                                  | `"°C"`            |
| `maxPoints`| `number` | No       | Number of points to display. Default: 50.          | `100`             |

---

## 8. `DisplayWidget`

Shows a simple numeric value received from the IoT server, with a configurable label and unit.

*   **`type`**: `"DisplayWidget"`
*   **Sends to IoT server:** None.
*   **Receives from IoT server:**
    ```json
    {
      "widgetId": "WIDGET_ID",
      "status": numeric_value
    }
    ```

### JSON Configuration:

| Property   | Type     | Required | Description                              | Example Value     |
| :--------- | :------- | :--------| :--------------------------------------- | :---------------- |
| `id`       | `string` | Yes      | Unique identifier.                       | `"tempDisplay"`   |
| `type`     | `string` | Yes      | Widget type. Always `"DisplayWidget"`.   | `"DisplayWidget"` |
| `label`    | `string` | Yes      | Label displayed above the value.         | `"Temperature"`   |
| `unit`     | `string` | No       | Measurement unit.                        | `"°C"`            |

---

## 9. `DashboardModalButtonWidget`

A button that, when pressed, opens a Bootstrap modal and renders a secondary dashboard (loaded from a JSON file) inside it.

*   **`type`**: `"DashboardModalButtonWidget"`
*   **Sends to IoT server:** None directly.  
*   **Receives from IoT server:** Depends on the widgets inside the secondary dashboard.

### JSON Configuration:

| Property   | Type     | Required | Description                                     | Example Value         |
| :--------- | :------- | :--------| :---------------------------------------------- | :-------------------- |
| `id`       | `string` | Yes      | Unique identifier.                              | `"settingsBtn"`       |
| `type`     | `string` | Yes      | Widget type. Always `"DashboardModalButtonWidget"`. | `"DashboardModalButtonWidget"` |
| `label`    | `string` | Yes      | Text on the button.                             | `"Open Settings"`     |
| `file`     | `string` | Yes      | Path to the JSON file of the secondary dashboard. | `"Dashboards/settings.json"` |

---
