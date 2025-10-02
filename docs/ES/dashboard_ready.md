# Sincronización Inicial Robusta: El Evento `DASHBOARD_READY`

En un sistema IoT, es crucial que el estado inicial de los widgets en el dashboard refleje con precisión el estado real del hardware en el momento de la conexión, especialmente después de que la página se recarga o un nuevo cliente se conecta.

Si el dashboard intenta pedir el estado demasiado pronto, o el hardware lo envía antes de que el frontend esté listo, se produce una **desincronización**.

## Solución: Handshake con `DASHBOARD_READY`

Para resolver esto, **iotRENDER** implementa un mecanismo de *handshake* (`DASHBOARD_READY`) basado en el siguiente flujo:

---

### Dashboard Frontend (Navegador)

1. Cuando el `index.html` se carga, `iotRenderer.js` inicia:

   * el proceso de renderizado del dashboard
   * la conexión WebSocket con el servidor IoT.

2. Cada widget (`SliderWidget`, `SwitchWidget`, `TextInputWidget`, `ApexGraphWidget`, etc.) pasa por su fase de inicialización y renderizado.

   * Los widgets que necesitan inicialización compleja (ej. gráficos que requieren un DOM visible) implementan un método `postRender()` que devuelve una **Promise**.

3. `iotRenderer.js` espera:

   * a que **todos los `postRender()`** de todos los widgets se completen
   * a que el DOM del dashboard esté completamente listo.

4. Solo entonces, `iotRenderer.js` establece la bandera interna:

   ```js
   dashboardFullyReady = true;
   ```

5. Una vez que:

   * `dashboardFullyReady === true`
   * y `websocket.readyState === WebSocket.OPEN`

   el `iotRenderer.js` envía un mensaje específico al servidor IoT:

   ```json
   {
     "widgetId": "dashboard",
     "action": "DASHBOARD_READY",
     "value": "true"
   }
   ```

---

### Buffer de Mensajes

* Si el servidor IoT envía mensajes **antes** de que el dashboard esté listo:

  * `iotRenderer.js` los almacena temporalmente en un `messageBuffer`.
* Una vez enviado el `DASHBOARD_READY`:

  * esos mensajes en buffer se procesan
  * y se reintentan para actualizar los widgets correspondientes.

---

### Servidor IoT 

1. El servidor IoT se conecta y espera mensajes.

2. Cuando recibe el mensaje `DASHBOARD_READY`, **sabe que el navegador está listo** para recibir actualizaciones.

3. En ese momento, invoca:

   ```python
   sendInitialStatesToClient(client)
   ```

   para enviar el **estado actual real** de *todos los widgets* al dashboard.
   Ejemplos:

   * brillo del LED
   * estado del Switch
   * valores de los TextInputs
   * etc.

4. Los widgets en el frontend, al recibir estos estados iniciales, **actualizan su UI** para reflejar la realidad del hardware.

---

## Resumen

El evento **`DASHBOARD_READY`** actúa como una señal de:

👉 *“Estoy vivo y listo para trabajar”*

que el **frontend** envía al **backend**.

Al recibirla, el backend responde con el **“estado actual del mundo”**, garantizando que el dashboard se sincronice y muestre la información correcta desde el primer momento, incluso con las complejidades de la carga asíncrona de JavaScript.
