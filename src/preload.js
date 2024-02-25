window.addEventListener('DOMContentLoaded', () => {
  const { contextBridge, ipcRenderer } = require('electron');
  
  ipcRenderer.on('sendVersions', (_event, versions) => {
    console.log(versions);
  });
  
  contextBridge.exposeInMainWorld('adlauncher', {
    getVersions: () => ipcRenderer.send('getVersions'),
    play: (version) => ipcRenderer.send('play', version),
    redirect: (url) => ipcRenderer.send('redirect', url)
  });
});