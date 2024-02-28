window.addEventListener('DOMContentLoaded', () => {
  const { contextBridge, ipcRenderer } = require('electron');
  
  const $ = selector => document.querySelector(selector);

  ipcRenderer.on('sendVersions', (_event, versions) => {
    const $versions = $('.versions');
    versions.unshift('Descargar Version');
    if($versions.children.length === 0) {
      versions.forEach(element => {
        if(element === 'Descargar Version') {
          $versions.innerHTML += `<div class='version' id='download-version'>${element}</div>`;
        } else {
          $versions.innerHTML += `<div class='version'>${element}</div>`;
        }
      });
    }
  });

  ipcRenderer.on('sendImg', (_event, version) => {
    let thumbnail;
    if(version.includes('forge')) {
      thumbnail = 'assets/forge.png';
    } else if(version.includes('fabric')) {
      thumbnail = 'assets/fabric.png';
    } else if(version.includes('OptiFine')) {
      thumbnail = 'assets/optifine.png';
    } else {
      thumbnail = 'assets/vanilla.png';
    }

    $('.version-img').src = thumbnail;
  });

  ipcRenderer.on('sendUser', (_event, user) => {
    $('#profile-user').innerText = user;
  })

  ipcRenderer.on('sendUsers', (_event, users, settings) => {
    let $users = $('.users');
    if(settings === 'settings') {
      $users = $('.users-list');
    }
    users.unshift('Crear Usuario');
    if($users.children.length === 0) {
      users.forEach(element => {
        if(element === 'Crear Usuario') {
          $users.innerHTML += `<div class='${settings === 'settings' ? 'settings-name' : 'name'}' id='create-user'>${element}</div>`;
        } else {
          $users.innerHTML += `<div class='${settings === 'settings' ? 'settings-name' : 'name'}'>${element}</div>`;
        }
      })
    }
  });

  const rootBox = $('.rootbox');
  const minBox = $('#min');
  const maxBox = $('#max');
  ipcRenderer.on('sendSettings', (_event, mainRoot, minMem, maxMem) => {
    rootBox.innerText = mainRoot;
    minBox.innerText = minMem;
    maxBox.innerText = maxMem;
  });

  ipcRenderer.on('changeRoot', (_event, dir) => {
    rootBox.innerText = dir;
  });

  ipcRenderer.on('changeMin', (_event, val) => {
    minBox.innerText = val;
  });

  ipcRenderer.on('changeMax', (_event, val) => {
    maxBox.innerText = val;
  });

  ipcRenderer.on('newUser', (event, user, repeated) => {
    $('#profile-user').innerText = user;
    if(!repeated) {
      $('.users').innerHTML += `<div class='name'>${user}</div>`
    }
  });

  ipcRenderer.on('newVersion', (event, version) => {
    if(version === 'ERROR') {
      alert('Ingresa una versión válida.');
    } else {
      $('#version-text').innerText = version;
    }
  });

  ipcRenderer.on('memoriesError', (event) => {
    alert('No se pueden ajustar las memorias a esa cantidad');
  });

  ipcRenderer.on('succesSaveSettings', (event) => {
    alert('Ajustes guardados correctamente');
  });
  
  contextBridge.exposeInMainWorld('adlauncher', {
    // ALL
    redirect: (url) => ipcRenderer.send('redirect', url),
    getUser: () => ipcRenderer.send('getUser'),
    getUsers: (settings) => ipcRenderer.send('getUsers', settings),
    getSettings: () => ipcRenderer.send('getSettings'),
    // INDEX
    play: (user, version) => ipcRenderer.send('play', user, version),
    getVersions: () => ipcRenderer.send('getVersions'),
    getImg: (version) => ipcRenderer.send('getImg', version),
    // SETTINGS
    changeRoot: () => ipcRenderer.send('changeRoot'),
    input: (opt) => ipcRenderer.send('input', opt),
    saveSettings: (newRoot, newMin, newMax) => ipcRenderer.send('saveSettings', newRoot, newMin, newMax),
    delete: (element, type) => ipcRenderer.send('delete', element, type)
  });
});