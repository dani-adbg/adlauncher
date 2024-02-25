const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { Launcher } = require('adlauncher-core');
const launcher = new Launcher();

// MINECRAFT 
const User = require('os').userInfo().username;
let mainRoot = `M:/develop/minecraft/adlauncher-core/minecraft`;

let versions = [];
try {
  versions = fs.readdirSync(`${mainRoot}/versions`);
} catch(error) {
  versions = [];
}

function minecraftLaunch(username, version, memory) {
  const launcherOptions = {
    username: username,
    version: version,
    gameDirectory: mainRoot,
    memory: {
      max: memory.max,
      min: memory.min
    }
  }
  
  launcher.launch(launcherOptions);
}


// ELECTRON
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'src', 'preload.js'),
    },
    // ESCONDE LA BARRA MENU
    // autoHideMenuBar: true,
    icon: path.join(__dirname, 'src', 'assets', 'icon.png'),
    resizable: false
    // frame: false
  });
  // ELIMINA LA BARRA
  win.menuBarVisible = false;
  ipcMain.on('redirect', (event, uri) => {
    const wi = new BrowserWindow({ parent: win });
    switch (uri) {
      case 'discord': 
        wi.loadURL('https://discord.gg/a93w5NpBR9')
        break;
      case 'yt': 
        wi.loadURL('https://www.youtube.com/@dani_adbg');
        break;
      case 'github': 
        wi.loadURL('https://github.com/dani-adbg');
        break;
      default:
        break;
    }
  })

  ipcMain.on('getVersions', (event) => {
    win.webContents.send('sendVersions', versions);
  })

  ipcMain.on('play', (event, version) => {
    minecraftLaunch('dani_adbg', '1.20.4-OptiFine_HD_U_I7_pre2', { max: '6G', min: '3G' });
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