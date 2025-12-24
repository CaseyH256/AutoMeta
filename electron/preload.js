const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: (options) => ipcRenderer.invoke('open-file-dialog', options),
  saveFile: (filePath, content) => ipcRenderer.invoke('save-file', filePath, content),
});