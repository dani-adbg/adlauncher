const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'src', 'preload.js'),
    },
    // ESCONDE LA BARRA MENU
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'src', 'assets', 'icon.png')
  });

  win.loadFile(path.join(__dirname, 'src', 'index.html'));
};

// CONFIGURACIONES GENERALES
app.on('ready', () => {
  createWindow();

  app.on('activate', () => {
    if(BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    };
  });
});

app.on('window-all-closed', () => {
  if(process.platform !== 'darwin') {
    app.quit();
  };
});

// CREA Y LEE EL ARCHIVO DE CONFIGURACION
