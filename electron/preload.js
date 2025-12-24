const { contextBridge } = require('electron');
const path = require('path');
const Store = require('electron-store');
const store = new Store();

contextBridge.exposeInMainWorld('electronAPI', {
  getStoreValue: (key) => store.get(key),
  setStoreValue: (key, value) => store.set(key, value),
  pathJoin: (...args) => path.join(...args),
});