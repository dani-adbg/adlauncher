// PAQUETES IMPORTADOS
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const prompt = require('electron-prompt');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const { Launcher, Downloader } = require('adlauncher-core');
const launcher = new Launcher();
const downloader = new Downloader();
const os = require('os');
const { spawn, execSync } = require('child_process');
const fetch = require('electron-fetch').default;

// VARIABLES
const User = os.userInfo().username;
let mainRoot = `C:/Users/${User}/AppData/Roaming/.minecraft`;
const appRoot = `${mainRoot}/.adlauncher`;
let javaRoot = 'C:/Program Files/Java/jdk-17/bin/java';
let java8Root = 'C:/Program Files/Java/jre-1.8/bin/java';
let configFile, maxMem, minMem, user, users, versions;
let isRunning = false;

// CREA EL ARCHIVO DE CONFIGS
if (!fs.existsSync(path.resolve(appRoot, 'configs', 'settings.json'))) {
  fs.mkdirSync(path.resolve(appRoot, 'configs'), { recursive: true });
  fs.writeFileSync(
    path.resolve(appRoot, 'configs', 'settings.json'),
    JSON.stringify({
      javaPath: javaRoot,
      java8Path: java8Root,
      gameDirectory: mainRoot,
      memory: { max: '4G', min: '2G' },
      users: ['Steve'],
    })
  );
}

// LEE EL ARCHIVO DE CONFIGS
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
  } catch (error) {
    versions = [];
  }

  // OBTIENE LOS DIRECTORIOS DE JAVA
  javaRoot = configFile.javaPath;
  java8Root = configFile.java8Path;
}
reloadConfigs();

// CHECKJAVA
function checkJava(javaVersions) {
  javaVersions.forEach((javaSpawn) => {
    const java = spawn(javaSpawn, ['-version']);

    java.on('error', () => {
      if (javaSpawn.includes('1.8')) {
        downloadJava(
          'https://javadl.oracle.com/webapps/download/AutoDL?BundleId=249553_4d245f941845490c91360409ecffb3b4',
          'java8.exe'
        );
      } else {
        downloadJava(
          'https://download.oracle.com/java/17/archive/jdk-17.0.10_windows-x64_bin.exe',
          'java17.exe'
        );
      }
    });
  });
}

// DOWNLOAD JAVA
async function downloadJava(javaUri, name) {
  try {
    const filePath = path.join(appRoot, name);
    const response = await fetch(javaUri);

    const writeStream = fs.createWriteStream(filePath);
    response.body.pipe(writeStream);

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    execSync(filePath);
    fs.unlinkSync(filePath);

    console.log(`Java ${name} instalado correctamente.`);
  } catch (error) {
    console.log(error);
  }
}

checkJava([javaRoot, java8Root]);

// ELECTRON
const createWindow = () => {
  // CREA LA VENTANA
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'src', 'preload.js'),
      // devTools: false,
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'src', 'assets', 'icon.png'),
    resizable: false,
  });
  win.menuBarVisible = false;

  // EVENTOS DEL PROGRAMA
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
  });

  ipcMain.on('getImg', (event, version) => {
    reloadConfigs();
    win.webContents.send('sendImg', version);
  });

  ipcMain.on('getVersions', () => {
    reloadConfigs();
    win.webContents.send('sendVersions', versions);
  });

  ipcMain.on('getUser', () => {
    reloadConfigs();
    win.webContents.send('sendUser', user);
  });

  ipcMain.on('getUsers', (event, settings) => {
    reloadConfigs();
    win.webContents.send('sendUsers', users, settings);
  });

  ipcMain.on('play', async (event, user, version) => {
    reloadConfigs();

    await launcher.launch({
      username: user,
      version: version,
      gameDirectory: mainRoot,
      memory: {
        max: maxMem,
        min: minMem,
      },
      java: javaRoot,
      java8: java8Root,
    });

    if (isRunning === false) {
      isRunning = true;
      launcher.on('debug', (data) => {
        win.webContents.send('debug', data);
      });
    }
  });

  ipcMain.on('getSettings', () => {
    reloadConfigs();
    win.webContents.send('sendSettings', mainRoot, minMem, maxMem, java8Root, javaRoot);
  });

  ipcMain.on('changeRoot', async (event, option) => {
    reloadConfigs();
    const dir = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Archivo', extensions: ['exe'] },
        { name: 'Carpeta', extensions: [''] },
      ],
    });
    if (dir.filePaths.length !== 0) {
      switch (option) {
        case 'main':
          configFile.gameDirectory = dir.filePaths[0].replace(/\\/g, '/');
          win.webContents.send('changeRoot', option, configFile.gameDirectory);
          break;

        case 'java8':
          configFile.java8Path = dir.filePaths[0].replace(/\\/g, '/');
          win.webContents.send('changeRoot', option, configFile.java8Path);
          break;

        case 'java':
          configFile.javaPath = dir.filePaths[0].replace(/\\/g, '/');
          win.webContents.send('changeRoot', option, configFile.javaPath);
          break;
      }
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
            type: 'number',
          },
          type: 'input',
        });
        configFile.memory.min = min + 'G';

        win.webContents.send('changeMin', min + 'G');
        break;

      case 'max':
        const max = await prompt({
          title: 'Ingrese un número entero',
          label: 'Valor:',
          inputAttrs: {
            type: 'number',
          },
          type: 'input',
        });
        configFile.memory.max = max + 'G';

        win.webContents.send('changeMax', max + 'G');
        break;

      case 'user':
        const newUser = await prompt({
          title: 'Ingrese el nuevo usuario',
          label: 'Nombre de Usuario',
          inputAttrs: {
            type: 'text',
          },
          type: 'input',
        });

        let repeated = true;
        if (!configFile.users.includes(newUser) || newUser.length === 0 || newUser === null) {
          configFile.users.push(newUser);
          fs.writeFileSync(
            path.resolve(appRoot, 'configs', 'settings.json'),
            JSON.stringify(configFile)
          );
          repeated = false;
        }
        win.webContents.send('newUser', newUser, repeated);
        reloadConfigs();
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
    if (newMin >= newMax || newMax >= availableMemory) {
      win.webContents.send('memoriesError');
    } else {
      win.webContents.send('succesSaveSettings');
      fs.writeFileSync(
        path.resolve(appRoot, 'configs', 'settings.json'),
        JSON.stringify(configFile)
      );
      reloadConfigs();
    }
  });

  ipcMain.on('delete', (event, element, type) => {
    reloadConfigs();
    if (type === 'version') {
      fse.removeSync(path.resolve(mainRoot, 'versions', element));
      fse.removeSync(path.resolve(mainRoot, 'natives', element));
    } else {
      configFile.users = configFile.users.filter((x) => x !== element);
      fs.writeFileSync(
        path.resolve(appRoot, 'configs', 'settings.json'),
        JSON.stringify(configFile)
      );
    }
  });

  // VERSIONS PAGES
  ipcMain.on('getVersionsPages', async () => {
    downloader.getVersions('vanilla').then((versions) => {
      versions = versions.filter((x) => x.id.split('.')[1] >= 8);
      win.webContents.send('sendVersionsPages', versions);
    });
  });

  ipcMain.on('downloadVersion', (event, version) => {
    downloader.download(version, mainRoot);
    downloader.on('percentDownloaded', (data) => {
      if (data.includes('100%')) {
        data = 'Instalando...';
        win.webContents.send('percentDownloaded', data);
      } else {
        win.webContents.send('percentDownloaded', data);
      }
    });
    downloader.on('downloadFiles', (data) => {
      if (data.includes('All files are downloaded')) {
        win.webContents.send('versionDownloaded');
      } else if (data.includes('Minecraft')) {
        win.webContents.send('versionDownloading');
      }
    });
  });

  // CARGA EL ARCHIVO PRINCIPAL EN LA VENTANA
  win.loadFile(path.join(__dirname, 'src', 'index.html'));
};

// CONFIGURACIONES GENERALES
app.on('ready', () => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});
