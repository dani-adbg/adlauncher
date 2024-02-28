const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const prompt = require('electron-prompt');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const { Launcher, Downloader } = require('adlauncher-core');
const launcher = new Launcher();
const downloader = new Downloader();
const os = require('os');

// MINECRAFT 
const User = os.userInfo().username;
const appRoot = `C:/Users/${User}/AppData/Roaming/adlauncher`;
let mainRoot = `C:/Users/${User}/AppData/Roaming/.minecraft`;

// CREA EL ARCHIVO DE CONFIGS
if(!fs.existsSync(path.resolve(appRoot, 'configs', 'settings.json'))) {
  fs.mkdirSync(path.resolve(appRoot, 'configs'), { recursive: true });
  fs.writeFileSync(path.resolve(appRoot, 'configs', 'settings.json'), JSON.stringify({ gameDirectory: mainRoot, memory: { max: '6G', min: '3G'}, users: []}));
};
// LEE EL ARCHIVO DE CONFIGS
let configFile, maxMem, minMem, user, users, versions;
function reloadConfigs() {
  configFile = JSON.parse(fs.readFileSync(path.resolve(appRoot, 'configs', 'settings.json')));

  // OBTIENE LA RUTA DEL JUEGO
  mainRoot = configFile.gameDirectory;

  // OBTIENE LAS MEMORIAS DECLARADAS
  maxMem = configFile.memory.max;
  minMem = configFile.memory.min;

  // OBTIENE EL ULTIMO USER CONECTADO
  try {
    user = configFile.users[0];
  } catch (error) {
    user = 'Steve';
  }

  // OBTIENE LOS USUARIOS REGISTRADOS
  users = configFile.users;
  mainRoot = configFile.gameDirectory;

  // OBTIENE LAS VERSIONES DESCARGADAS
  try {
    versions = fs.readdirSync(`${mainRoot}/versions`);
  } catch(error) {
    versions = [];
  };
}
reloadConfigs();


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
    resizable: false,
    // frame: false
  });
  // ELIMINA LA BARRA
  win.menuBarVisible = false;
  ipcMain.on('redirect', (event, uri) => {
    const wi = new BrowserWindow({ parent: win });
    switch (uri) {
      case 'discord': 
        wi.loadURL('https://discord.gg/a93w5NpBR9');
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
    reloadConfigs();
    win.webContents.send('sendImg', version);
  });

  ipcMain.on('getVersions', (event) => {
    reloadConfigs();
    win.webContents.send('sendVersions', versions);
  });

  ipcMain.on('getUser', (event) => {
    reloadConfigs();
    win.webContents.send('sendUser', user);
  });

  ipcMain.on('getUsers', (event, settings) => {
    reloadConfigs();
    win.webContents.send('sendUsers', users, settings);
  });

  // ipcMain.on('createUser', (event) => {
  //   win.webContents.send('createUser');
  // });

  ipcMain.on('play', (event, user, version, ) => {
    reloadConfigs();
    minecraftLaunch(user, version, { max: '6G', min: '3G' });
  });

  ipcMain.on('getSettings', (event) => {
    reloadConfigs();
    win.webContents.send('sendSettings', mainRoot, minMem, maxMem)
  });

  ipcMain.on('changeRoot', async (event) => {
    reloadConfigs();
    const dir = await dialog.showOpenDialog({ properties: ['openDirectory']});
    if(dir.filePaths.length !== 0) {
      configFile.gameDirectory = dir.filePaths[0].replace(/\\/g, '/');
      
      win.webContents.send('changeRoot', configFile.gameDirectory);
    }
  });

  ipcMain.on('input', async (event, opt) => {
    reloadConfigs();
    switch (opt) {
      case 'min':
        const min = await prompt({ 
          title: 'Ingrese un número entero',
          label: 'Valor:',
          inputAttrs: {
            type: 'number' 
          },
          type: 'input'
        });
        configFile.memory.min = min+'G';

        win.webContents.send('changeMin', min+'G');
        break;
    
      case 'max':
        const max = await prompt({ 
          title: 'Ingrese un número entero',
          label: 'Valor:',
          inputAttrs: {
            type: 'number' 
          },
          type: 'input'
        });
        configFile.memory.max = max+'G';

        win.webContents.send('changeMax', max+'G');
        break;

      case 'user':
        const newUser = await prompt({
          title: 'Ingrese el nuevo usuario',
          label: 'Nombre de Usuario',
          inputAttrs: {
            type: 'text'
          },
          type: 'input'
        });

        let repeated = true;
        if(!configFile.users.includes(newUser) || newUser.length === 0 || newUser === null) {
          configFile.users.push(newUser);
          fs.writeFileSync(path.resolve(appRoot, 'configs', 'settings.json'), JSON.stringify(configFile));
          repeated = false;
        }
        win.webContents.send('newUser', newUser, repeated);
        reloadConfigs();
        break;

      case 'version':
        const newVersion = await prompt({
          title: 'Ingrese la nueva version',
          label: 'Version',
          inputAttrs: {
            type: 'text'
          },
          type: 'input'  
        });

        downloader.download(newVersion, mainRoot)

        win.webContents.send('newVersion', newVersion);
        break;
      default:
        break;
    }
  });

  ipcMain.on('saveSettings', (event, newRoot, newMin, newMax) => {
    configFile.gameDirectory = newRoot;
    configFile.memory.min = newMin;
    configFile.memory.max = newMax;
    const availableMemory = Math.floor((os.totalmem() - os.freemem()) / 1073741824);
    if(newMin >= newMax || newMax >= availableMemory) {
      win.webContents.send('memoriesError');
    } else {
      win.webContents.send('succesSaveSettings');
      fs.writeFileSync(path.resolve(appRoot, 'configs', 'settings.json'), JSON.stringify(configFile));
      reloadConfigs();
    }
  });

  ipcMain.on('delete', (event, element, type) => {
    reloadConfigs();
    if(type === 'version') {
      fse.removeSync(path.resolve(mainRoot, 'versions', element));
      fse.removeSync(path.resolve(mainRoot, 'natives', element));
    } else {
      configFile.users = configFile.users.filter(x => x !== element);
      fs.writeFileSync(path.resolve(appRoot, 'configs', 'settings.json'), JSON.stringify(configFile));
    }
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