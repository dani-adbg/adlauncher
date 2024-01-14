// LAUNCHER 
const { Client, Authenticator } = require('minecraft-launcher-core');
const PCuser = require('os').userInfo().username;
const launcher = new Client();
// MENU
const fs = require('fs');
const root = `C:/Users/${PCuser}/AppData/Roaming/.minecraft`;
const logs = `${root}/logs/latest.log`;
const inquirer = require('inquirer');

let user, version, data;

function getData() {
  // Obtener el último usuario
  try {
    data = fs.readFileSync(`${root}/usercache.JSON`, 'utf-8');
    data = JSON.parse(data);
    fechas = data.map(item  => ({ ...item, fecha: new Date(item.fecha) }));
    user = fechas.reduce((fechaActual, fechaSiguiente) => {
      return fechaSiguiente > fechaActual ? fechaSiguiente : fechaActual;
    }, fechas[0]);
  } catch (error) {
    return userConfig();
  }

  // Obtener la última versión
  try {
    const archivoStream = fs.readFileSync(logs, 'utf-8');
    const regex = /Starting integrated minecraft server version (\d+\.\d+)/;
    const matches = archivoStream.match(regex);
    version = matches[0].split(' ');
    version = version[version.length - 1];
  } catch (error) {
    return versionConfig();
  }

  // Ejecutar el menu principal
  menu();
}

getData();

function menu() {
  const optionsMenu = [{
    type: 'list',
    name: 'option',
    message: 'Seleccione una opción (usa las flechas arriba/abajo y presiona Enter',
    choices: [
      {
        value: '1',
        name: 'JUGAR'
      },
      {
        value: '2',
        name: `User: ${user.name}`
      },
      {
        value: '3',
        name: `Version: ${version}`
      },
      {
        value: '4',
        name: 'Salir'
      }
    ]
  }];

  console.clear();
  console.log('BIENVENIDO A ADLAUNCHER');
  console.log('MENU:');
  inquirer.prompt(optionsMenu).then(a => {
    switch (a.option) {
      case '1':
        launc();
        break;
      case '2':
        userConfig();
        break;
      case '3':
        versionConfig();
        break;
      case '4':
        exit();
        break;
      default:
        break;
    }
  }).catch(e => console.log(e));
}

function userConfig() {
  data = data ? data.map(x => x.name) : [];
  console.clear();
  console.log('CONFIGURACION DE USUARIO');
  let optionsUsers = [{
    type: 'list',
    name: 'userOption',
    message: 'Escoge una opcion de usuario',
    choices: [
      {
        name: 'Crear nuevo usuario'
      },
      ...data,
      {
        name: 'Salir'
      }
    ]
  }];

  inquirer.prompt(optionsUsers).then(a => {
    switch (a.userOption) {
      case 'Crear nuevo usuario':
        newUser();
        break;
      case 'Salir':
        exit();
        break;
      default:
        user = a.userOption;
        launc();
        break;
    }
  })
}

function newUser() {
  console.clear();
  console.log('CREA UN NUEVO USUARIO: ');

  const nUser = [
    {
      type: 'input',
      name: 'username',
      message: 'Ingresa un nuevo nombre de usuario',
      validate(value) {
        if(value.length === 0) {
          return 'Ingresa un valor';
        }
        return true;
      }
    }
  ];

  inquirer.prompt(nUser).then(a => {
    user = a.username;
    launc();
  })
}

function versionConfig() {
  let files;
  try {
    files = fs.readdirSync(root + '/versions');
  } catch (error) {
    files = [];
  }
  console.clear();
  console.log('CONFIGURACION DE VERSIONES');
  const optionsVersions = [{
    type: 'list',
    name: 'versionConfig',
    message: 'Escoge una opcion de version',
    choices: [
      {
        name: 'Descargar version'
      },
      ...files,
      {
        name: 'Salir'
      }
    ]
  }];
  inquirer.prompt(optionsVersions).then(a => {
    switch (a.versionConfig) {
      case 'Descargar version':
        newVersion();
        break;
      case 'Salir':
        exit();
        break;
      default:
        version = a.versionOption;
        launc();
        break;
    }
  })
}

function newVersion() {
  console.clear();
  console.log('DESCARGA UNA NUEVA VERSION: ');

  const nVersion = [
    {
      type: 'input',
      name: 'version',
      message: 'Ingresa la version que quieras descargar',
      validate(value) {
        if(value.length === 0) {
          return 'Ingresa un valor';
        }
        return true;
      }
    }
  ];

  inquirer.prompt(nVersion).then(a => {
    version = a.version;
    launc();
  })
}

function exit() {
  process.exit(0);
}

function launc() {
  console.clear();

  if(user === undefined || user === null) {
    userConfig();
  } else if(version === undefined || version === null) {
    versionConfig();
  } else {
    launch(user.name == undefined ? user : user.name, version);
  }
}

function launch(name, version) {
  let opts = {
    authorization: Authenticator.getAuth(name),
    root: root,
    version: {
      number: version,
      type: "release"
    },
    memory: {
      max: "6G",
      min: "4G"
    }
  }
  
  launcher.launch(opts);
  
  launcher.on('debug', (e) => console.log(e));
  launcher.on('data', (e) => console.log(e));
}