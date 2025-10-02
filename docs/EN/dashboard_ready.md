# Robust Initial Synchronization: The `DASHBOARD_READY` Event

In an IoT system, it is crucial that the initial state of the widgets on the dashboard accurately reflects the real state of the hardware at the time of connection, especially after the page reloads or a new client connects.

If the dashboard attempts to request the state too early, or the hardware sends it before the frontend is ready, a **desynchronization** occurs.

## Solution: Handshake with `DASHBOARD_READY`

To solve this, **iotRENDER** implements a *handshake* mechanism (`DASHBOARD_READY`) based on the following flow:

---

### Dashboard Frontend (Browser)

1. When `index.html` loads, `iotRenderer.js` starts:

   * the dashboard rendering process
   * the WebSocket connection with the IoT server.

2. Each widget (`SliderWidget`, `SwitchWidget`, `TextInputWidget`, `ApexGraphWidget`, etc.) goes through its initialization and rendering phase.

   * Widgets requiring complex initialization (e.g., charts that need a visible DOM) implement a `postRender()` method that returns a **Promise**.

3. `iotRenderer.js` waits:

   * for **all `postRender()` calls** of all widgets to complete
   * for the dashboard DOM to be fully ready.

4. Only then, `iotRenderer.js` sets the internal flag:

   ```js
   dashboardFullyReady = true;
   ```

5. Once:

   * `dashboardFullyReady === true`
   * and `websocket.readyState === WebSocket.OPEN`

   the `iotRenderer.js` sends a specific message to the IoT server:

   ```json
   {
     "widgetId": "dashboard",
     "action": "DASHBOARD_READY",
     "value": "true"
   }
   ```

---

### Message Buffer

* If the IoT server sends messages **before** the dashboard is ready:

  * `iotRenderer.js` temporarily stores them in a `messageBuffer`.
* Once `DASHBOARD_READY` has been sent:

  * those buffered messages are processed
  * and retried to update the corresponding widgets.

---

### IoT Server

1. The IoT server connects and waits for messages.

2. When it receives the `DASHBOARD_READY` message, it **knows the browser is ready** to receive updates.

3. At that point, it calls:

   ```python
   sendInitialStatesToClient(client)
   ```

   to send the **real current state** of *all widgets* to the requesting dashboard.
   Examples:

   * LED brightness
   * Switch state
   * TextInput values
   * etc.

4. The widgets on the frontend, upon receiving these initial states, **update their UI** to reflect the actual hardware state.

---

## Summary

The **`DASHBOARD_READY`** event acts as a signal:

👉 *“I am alive and ready to work”*

that the **frontend** sends to the **backend**.

Upon receiving it, the backend responds with the **“current state of the world”**, ensuring the dashboard is synchronized and displays the correct information from the very first moment, even with the complexities of asynchronous JavaScript loading.

