# iotRENDER Documentation

Guide to configuring and creating dashboards for IoT projects with **Arduino**, **ESP32**, **Raspberry Pi**, and other compatible devices using **iotRENDER**.  

The following steps explain how to create and set up a project:

---

## 1. Create a Dashboard

iotRENDER dashboards are defined using **JSON** files.  
You can create a main `dashboard.json` file and, if your project requires it, additional secondary dashboards that contain more widgets.  

- Secondary dashboards are stored in the `Dashboards/` folder.  
- You can also store the main dashboard in this folder, as long as you update the path in `index.html` accordingly.  

📌 Related documentation:  
- 🔗 [Structure of a Dashboard JSON File](./Structure-of-a-Dashboard.md)  
- 🔗 [Widgets Documentation](./widgets.md)  

---

## 2. Frontend Configuration

You need to edit `index.html` to set:  
- The **URL of your IoT server**.  
- The **path to your main dashboard**.  
- Ensure that all the required files are available.  

📌 See also:  
- 🔗 [Frontend Configuration](./Frontend-Configuration.md)  

---

## 3. Getting Started

iotRENDER requires a server to run.  
You can start a local HTTP server using **Python** as follows:

1. Open a terminal and navigate to the root of your project.  
2. Start the server on port 8000:  
   ```bash
   python -m http.server 8000
