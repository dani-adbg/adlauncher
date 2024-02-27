const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const prompt = require('electron-prompt');
const path = require('path');
const fs = require('fs');
const { Launcher } = require('adlauncher-core');
const launcher = new Launcher();

// MINECRAFT 
const User = require('os').userInfo().username;
const appRoot = `C:/Users/${User}/AppData/Roaming/adlauncher`;
// let mainRoot = `M:/develop/minecraft/adlauncher-core/minecraft`;
let mainRoot = `C:/Users/${User}/AppData/Roaming/.minecraft`;

// CREA EL ARCHIVO DE CONFIGS
if(!fs.existsSync(path.resolve(appRoot, 'configs', 'settings.json'))) {
  fs.mkdirSync(path.resolve(appRoot, 'configs'), { recursive: true });
  fs.writeFileSync(path.resolve(appRoot, 'configs', 'settings.json'), JSON.stringify({ gameDirectory: mainRoot, memory: { max: '6G', min: '3G'}, users: []}));
};
// LEE EL ARCHIVO DE CONFIGS
let configFile, maxMem, minMem, user, data, users;
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
}
reloadConfigs();
mainRoot = configFile.gameDirectory;

// OBTIENE LAS VERSIONES DESCARGADAS
let versions = [];
try {
  versions = fs.readdirSync(`${mainRoot}/versions`);
} catch(error) {
  versions = [];
};

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
    const indice = users.indexOf(user);
    users.splice(indice, 1);
    fs.writeFileSync(path.resolve(appRoot, 'configs', 'settings.json'), JSON.stringify(configFile));
    users.unshift(user);
    fs.writeFileSync(path.resolve(appRoot, 'configs', 'settings.json'), JSON.stringify(configFile));

  });

  ipcMain.on('getUsers', (event) => {
    win.webContents.send('sendUsers', users);
  });

  // ipcMain.on('createUser', (event) => {
  //   win.webContents.send('createUser');
  // });

  ipcMain.on('play', (event, user, version, ) => {
    minecraftLaunch(user, version, { max: '6G', min: '3G' });
  });

  ipcMain.on('getSettings', (event) => {
    reloadConfigs();
    win.webContents.send('sendSettings', mainRoot, minMem, maxMem)
  });

  ipcMain.on('changeRoot', async (event) => {
    const dir = await dialog.showOpenDialog({ properties: ['openDirectory']});
    if(dir.filePaths.length !== 0) {
      configFile.gameDirectory = dir.filePaths[0].replace(/\\/g, '/');

      fs.writeFileSync(path.resolve(appRoot, 'configs', 'settings.json'), JSON.stringify(configFile));
      
      win.webContents.send('changeRoot', configFile.gameDirectory);
    }
  });

  ipcMain.on('input', async (event, opt) => {
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

        fs.writeFileSync(path.resolve(appRoot, 'configs', 'settings.json'), JSON.stringify(configFile));

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

        fs.writeFileSync(path.resolve(appRoot, 'configs', 'settings.json'), JSON.stringify(configFile));

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

        if(!configFile.users.includes(newUser) || newUser.length === 0) {
          configFile.users.push(newUser);
          fs.writeFileSync(path.resolve(appRoot, 'configs', 'settings.json'), JSON.stringify(configFile));

        }
        
        win.webContents.send('newUser', newUser);
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

        win.webContents.send('newVersion', newVersion);
        break;
      default:
        break;
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