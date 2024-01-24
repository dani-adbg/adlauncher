// LAUNCHER 
const { Client, Authenticator } = require('minecraft-launcher-core');
const PCuser = require('os').userInfo().username;
const launcher = new Client();
// MENU
const fs = require('fs');
const root = `C:/Users/${PCuser}/AppData/Roaming/.minecraft`;
const inquirer = require('inquirer');
// FORGE
const axios = require('axios');

let user, version, data, url, downRoot;
const vTested = ['1.16.5', '1.17.1', '1.18', '1.18.1', '1.18.2'];
const vNew = ['1.19', '1.19.1', '1.19.2', '1.19.3', '1.19.4', '1.20', '1.20.1', '1.20.2', '1.20.3'];

const exist = (ruta) => {
  try {
    return fs.statSync(ruta).isDirectory();
  } catch (error) {
    return false;
  }
};

if(!exist(root)) fs.mkdirSync(root);
if(!exist(root+'/adlauncher')) fs.mkdirSync(root+'/adlauncher');
if(!exist(root+'/adlauncher/forgedown')) fs.mkdirSync(root+'/adlauncher/forgedown');
if(!fs.existsSync(root+'/launcher_profiles.json')) createProfile();

function createProfile() {
  const profile = {
    selectedAccountUUID:"c1eab8bf180f11eda78bf02f74958c02",
    clientToken:"2788918e-eb1d-42f3-927a-94f7c8deada8",
    profiles:{
      "fabric-loader-1.20.1":{
        lastUsed:"2023-11-09T19:12:58+0300",
        lastVersionId:"fabric-loader-0.14.24-1.20.1",
        created:"2023-11-09T19:12:58+0300",
        name:"fabric-loader-1.20.1",
        icon:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACABAMAAAAxEHz4AAAAGFBMVEUAAAA4NCrb0LTGvKW8spyAem2uppSakn5SsnMLAAAAAXRSTlMAQObYZgAAAJ5JREFUaIHt1MENgCAMRmFWYAVXcAVXcAVXcH3bhCYNkYjcKO8dSf7v1JASUWdZAlgb0PEmDSMAYYBdGkYApgf8ER3SbwRgesAf0BACMD1gB6S9IbkEEBfwY49oNj4lgLhA64C0o9R9RABTAvp4SX5kB2TA5y8EEAK4pRrxB9QcA4QBWkj3GCAMUCO/xwBhAI/kEsCagCHDY4AwAC3VA6t4zTAMj0OJAAAAAElFTkSuQmCC",
        type:"custom"
      }
    },
    accounts:{
      c1eab8bf180f11eda78bf02f74958c02:{
        skinType:"tlauncher",
        displayName:"dani_adbg",
        profiles:[{
          name:"dani_adbg",
          id:"c1eab8bf-180f-11ed-a78b-f02f74958c02"
        }],accessToken:"4befb45d-d6fe-44a5-a0f0-2585758ccbb9",
        type:"tlauncher",
        userID:"dani_adbg",
        uuid:"c1eab8bf-180f-11ed-a78b-f02f74958c02",
        selectedProfile:{
          name:"dani_adbg",
          id:"c1eab8bf-180f-11ed-a78b-f02f74958c02"
        },
        username:"dani_adbg",
        premiumAccount:false
      }
    },
    freeAccountUUID:"2f24d9c7e7fd48a281afba68e3907cfb"
  }
  
  fs.writeFileSync(`${root}/launcher_profiles.json`, JSON.stringify(profile));
}

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
        version !== undefined ? verifyLaunch() : menu();
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
  fs.readdirSync(`${root}/adlauncher/forgedown`).forEach(element => {
    files.push(element);
  });
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

  inquirer.prompt(nVersion).then(a => {
    version = a.version;

    if(version.startsWith('forge-')) {
      const dVersion = version.split('forge-').pop();
      if(vTested.includes(dVersion) || vNew.includes(dVersion)) {
        url = `https://files.minecraftforge.net/net/minecraftforge/forge/index_${dVersion}.html`;
        downRoot = `${root}/adlauncher/forgedown/forge-${dVersion}.jar`;
        
        axios.get(url).then(async a => {
          const match = a.data.match(/<a href="([^"]+installer\.jar)">/);
          if(match && match[1]) {
            let downloadLink = match[1];
            if(downloadLink.includes('url='))
              downloadLink = downloadLink.split('url=').pop();
            const forgeResponse = await axios.get(downloadLink, {
              responseType: 'stream'
            });
            const writer = fs.createWriteStream(downRoot, { encoding: 'utf-8' });
            forgeResponse.data.pipe(writer);
            await new Promise((resolve, reject) => {
              writer.on('finish', resolve);
              writer.on('error', reject);
            }).then(() => {
              menu();
            })
          } else {
            throw new Error('No se ha encontrado el link del archivo JAR');
          }
        }).catch((e) => console.log(e));
      } else {
        console.log(`La versión ${dVersion} no está en la lista de versiones testeadas.`);
        console.log("Regresando a MENU DE OPCIONES");
        setTimeout(() => {
          versions();
        }, 2000);
      }
    } else {
      menu();
    }
  })
}

function exit() {
  process.exit(0);
}

function verifyLaunch() {
  const name = user.name == undefined ? user : user.name;
  let custom, opts;
  if(version.startsWith('forge-')) {
    custom = version.replace(/\.jar$/, '');
    version = version.match(/-(\d+(\.\d+)*)(\.jar)?/)[1];
    downRoot = `${downRoot !== undefined ? downRoot : `${root}/adlauncher/forgedown/forge-${version}.jar`}`;
    opts = {
      authorization: Authenticator.getAuth(name),
      root: root,
      version: {
        number: version,
        type: "release"
      },
      forge: downRoot,
      memory: {
        max: "6G",
        min: "4G"
      }
    }
    vTested.includes(version) ? opts.version.custom = custom : null;
    launch(opts);
  } else {
    opts = {
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
    if(version.length > 6) {
      const match = version.match(/(\d+\.\d+(?:\.\d+)*)(-(?:[A-Za-z0-9]+_?)+)/);
      opts.version.number = match[1];
      const custom = match.input;
      opts.version.custom = custom;
    }
    launch(opts);
  }
}

function launch(options) {
  launcher.launch(options);
  launcher.on('debug', (e) => console.log(e));
  launcher.on('data', (e) => console.log(e));
}