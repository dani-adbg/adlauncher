// Importación de módulos necesarios
const { Downloader, Launcher } = require('adlauncher-core'); // Módulos para descargar y lanzar Minecraft
const PCuser = require('os').userInfo().username; // Nombre de usuario del PC actual
const fs = require('fs'); // Sistema de archivos
const inquirer = require('inquirer'); // Para crear menús interactivos

// Directorio raíz de Minecraft en el sistema de archivos
const root = `C:/Users/${PCuser}/AppData/Roaming/.minecraft`;

let user, version, data; // Variables globales para el usuario, la versión y los datos de usuario

// Función para obtener los datos del usuario
function getData() {
  try {
    // Intenta leer el archivo de caché de usuarios
    data = fs.readFileSync(`${root}/usercache.JSON`, 'utf-8');
    data = JSON.parse(data);
    // Convierte las fechas en objetos Date para comparar
    fechas = data.map(item => ({ ...item, fecha: new Date(item.fecha) }));
    // Obtiene el usuario más reciente basado en la fecha
    user = fechas.reduce((fechaActual, fechaSiguiente) => {
      return fechaSiguiente > fechaActual ? fechaSiguiente : fechaActual;
    }, fechas[0]);
  } catch (error) {
    // Si hay un error al leer los datos del usuario, solicita la configuración del usuario
    return userConfig();
  }
  // Si se obtienen los datos del usuario con éxito, muestra el menú principal
  menu();
}

// Llamada inicial para obtener los datos del usuario al inicio del programa
getData();

// Función para mostrar el menú principal
function menu() {
  // Opciones del menú principal
  const optionsMenu = [{
    type: 'list',
    name: 'option',
    message: 'Seleccione una opción:',
    choices: [
      { value: '1', name: 'JUGAR' },
      { value: '2', name: `User: ${user.name !== undefined ? user.name : user}` },
      { value: '3', name: `Version: ${version !== undefined ? version : 'Selecciona la version'}` },
      { value: '4', name: 'Salir' }
    ]
  }];

  // Limpia la consola y muestra el título del menú
  console.clear();
  console.log('BIENVENIDO A ADLAUNCHER');
  console.log('MENU:');

  // Muestra el menú y ejecuta la opción seleccionada
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

// Función para configurar el usuario
function userConfig() {
  // Muestra las opciones de configuración de usuario
  data = data ? data.map(x => x.name) : [];
  console.clear();
  console.log('CONFIGURACION DE USUARIO');
  let optionsUsers = [{
    type: 'list',
    name: 'userOption',
    message: 'Escoge una opción de usuario:',
    choices: [
      { name: 'Crear nuevo usuario' },
      ...data,
      { name: 'Salir' }
    ]
  }];

  // Solicita al usuario que elija una opción de usuario
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

// Función para crear un nuevo usuario
function newUser() {
  console.clear();
  console.log('CREA UN NUEVO USUARIO: ');

  // Pide al usuario que ingrese un nuevo nombre de usuario
  const nUser = [{
    type: 'input',
    name: 'username',
    message: 'Ingresa un nuevo nombre de usuario:',
    validate(value) {
      if (value.length === 0) {
        return 'Ingresa un valor válido';
      }
      return true;
    }
  }];

  // Solicita al usuario que ingrese el nombre de usuario y lo establece como el usuario actual
  inquirer.prompt(nUser).then(a => {
    user = a.username;
    menu();
  })
}

// Función para mostrar las versiones disponibles
function versions() {
  let files = [];
  try {
    // Intenta leer los archivos en el directorio de versiones de Minecraft
    files = fs.readdirSync(`${root}/versions`);
  } catch (error) {
    files = [];
  }
  console.clear();
  console.log("CONFIGURACION DE VERSIONES");

  // Opciones para el menú de selección de versiones
  const optionsVersions = [{
    type: 'list',
    name: 'versionConfig',
    message: 'Escoge una opción de versión:',
    choices: [
      { name: 'Descargar versión' },
      ...files,
      { name: 'Salir' }
    ]
  }];

  // Solicita al usuario que elija una opción de versión
  inquirer.prompt(optionsVersions).then(a => {
    let option = a.versionConfig;
    switch (option) {
      case 'Descargar versión':
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

// Función para descargar una nueva versión
function newVersion() {
  console.clear();
  console.log('DESCARGA UNA NUEVA VERSIÓN: ');

  // Pide al usuario que ingrese la versión que desea descargar
  const nVersion = [{
    type: 'input',
    name: 'version',
    message: 'Ingresa la versión que quieres descargar:',
    validate(value) {
      if (value.length === 0) {
        return 'Ingresa un valor válido';
      }
      return true;
    }
  }];

  // Solicita al usuario que ingrese la versión y luego inicia la descarga
  inquirer.prompt(nVersion).then(async a => {
    version = a.version;

    // Descarga la versión y luego muestra el menú principal
    await downloader.download(version, root);
    menu();
  })
}

// Función para salir del programa
function exit() {
  // Termina el proceso actual
  process.exit(0);
}

// Función para lanzar el juego
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

  // Lanza el juego con las opciones especificadas
  launcher.launch(launchOptions);
}
