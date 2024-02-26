const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { Launcher } = require('adlauncher-core');
const launcher = new Launcher();

// MINECRAFT 
const User = require('os').userInfo().username;
let mainRoot = `M:/develop/minecraft/adlauncher-core/minecraft`;
// let mainRoot = `C:/Users/DANI/AppData/Roaming/.minecraft`;

let versions = [];
try {
  versions = fs.readdirSync(`${mainRoot}/versions`);
} catch(error) {
  versions = [];
}

let user, data, users;
try {
  data = fs.readFileSync(`${mainRoot}/usercache.JSON`, 'utf-8');
  data = JSON.parse(data);
  fechas = data.map(item  => ({ ...item, fecha: new Date(item.fecha) }));
  user = fechas.reduce((fechaActual, fechaSiguiente) => {
    return fechaSiguiente > fechaActual ? fechaSiguiente : fechaActual;
  }, fechas[0]).name;
} catch (error) {
  return 'Steve';
}

users = data ? data.map(x => x.name) : [];

let maxMem = '6G', minMem = '3G';

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
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'src', 'assets', 'icon.png'),
    // resizable: false
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

  ipcMain.on('getImg', (event, version) => {
    win.webContents.send('sendImg', version);
  });

  ipcMain.on('getVersions', (event) => {
    win.webContents.send('sendVersions', versions);
  });

  ipcMain.on('getUser', (event) => {
    win.webContents.send('sendUser', user);
  });

  ipcMain.on('getUsers', (event) => {
    win.webContents.send('sendUsers', users);
  });

  // ipcMain.on('createUser', (event) => {
  //   win.webContents.send('createUser');
  // });

  ipcMain.on('play', (event, user, version) => {
    minecraftLaunch(user, version, { max: '6G', min: '3G' });
  });

  ipcMain.on('getSettings', (event) => {
    win.webContents.send('sendSettings', mainRoot, minMem, maxMem)
  })

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