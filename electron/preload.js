import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(channel, listener) {
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(channel, ...args) {
    return ipcRenderer.off(channel, ...args)
  },
  send(channel, ...args) {
    return ipcRenderer.send(channel, ...args)
  },
  invoke(channel, ...args) {
    return ipcRenderer.invoke(channel, ...args)
  },
});