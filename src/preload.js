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

  ipcRenderer.on('sendUsers', (_event, users) => {
    let $users = $('.users');
    users.unshift('Crear Usuario');
    if($users.children.length === 0) {
      users.forEach(element => {
        if(element === 'Crear Usuario') {
          $users.innerHTML += `<div class='name' id='create-user'>${element}</div>`;
        } else {
          $users.innerHTML += `<div class='name'>${element}</div>`;
        }
      })
    }
  });

  ipcRenderer.on('sendSettings', (_event, mainRoot, minMem, maxMem) => {
    $('.rootbox').innerText = mainRoot;
    $('#min').innerText = minMem;
    $('#max').innerText = maxMem;
  });
  
  contextBridge.exposeInMainWorld('adlauncher', {
    getVersions: () => ipcRenderer.send('getVersions'),
    play: (user, version) => ipcRenderer.send('play', user, version),
    redirect: (url) => ipcRenderer.send('redirect', url),
    getImg: (version) => ipcRenderer.send('getImg', version),
    getUser: () => ipcRenderer.send('getUser'),
    getUsers: () => ipcRenderer.send('getUsers'),
    downloadVersion: () => ipcRenderer.send('downloadVersion'),
    // createUser: () => ipcRenderer.send('createUser'),
    getSettings: () => ipcRenderer.send('getSettings')
  });
});