import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

const app = createApp(App);


app.mount('#app').$nextTick(() => {
  // Use contextBridge
  window.ipcRenderer.on('main-process-message', (_event, message) => {
	debugger
    console.log(message)
  });
})
