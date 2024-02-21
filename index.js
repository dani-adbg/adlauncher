// LAUNCHER 
const { Downloader, Launcher } = require('adlauncher-core');
const PCuser = require('os').userInfo().username;
const launcher = new Launcher();
const downloader = new Downloader();
// MENU
const fs = require('fs');
const root = `C:/Users/${PCuser}/AppData/Roaming/.minecraft`;
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
        name: `User: ${user.name !== undefined ? user.name : user}`
      },
      {
        value: '3',
        name: `Version: ${version !== undefined ? version : 'Selecciona la version'}`
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
        version !== undefined ? launch() : menu();
        break;
      case '2':
        userConfig();
        break;
      case '3':
        versions();
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
        menu();
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
    menu();
  })
}

function versions() {
  let files = [];
  try {
    files = fs.readdirSync(`${root}/versions`);
  } catch(error) {
    files = [];
  }
  console.clear();
  console.log("CONFIGURACION DE VERSIONES");
  const optionsVersions = [{
    type: 'list',
    name: 'versionConfig',
    message: 'Escoge una opción de versión',
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
    let option = a.versionConfig;
    switch (option) {
      case 'Descargar version':
        newVersion();
        break;
      case 'Salir':
        exit();
        break;
      default:
        version = option;
        menu();
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

  inquirer.prompt(nVersion).then(async a => {
    version = a.version;

    await downloader.download(version, root);
    menu();
  })
}

function exit() {
  process.exit(0);
}

function launch() {
  const name = user.name == undefined ? user : user.name;
  const launchOptions = {
    username: name, 
    version: version, 
    gameDirectory: root,
    memory: { 
      min: '2G', 
      max: '6G'  
    }
  }
  
  launcher.launch(launchOptions);
}