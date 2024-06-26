// PRELOAD FILE
window.addEventListener('DOMContentLoaded', () => {
  const { contextBridge, ipcRenderer } = require('electron');

  const $ = (selector) => document.querySelector(selector);

  // DOWNLOAD JAVA PAGE
  ipcRenderer.on('java', (_event, javaVersion) => {
    $('#java').innerText = javaVersion;

    $('#accept').addEventListener('click', () => {
      ipcRenderer.send('accept', javaVersion);
      $('.main').innerText = `DESCARGANDO JAVA ${javaVersion}...`;
    });

    $('#cancel').addEventListener('click', () => {
      ipcRenderer.send('cancel');
    });
  });

  // INDEX PAGE
  // VERSION SELECTOR BOX
  ipcRenderer.on('sendVersions', (_event, versions) => {
    const $versions = $('.versions');
    if ($versions.children.length === 0) {
      versions.forEach((element) => {
        $versions.innerHTML += `<div class='version'>${element}</div>`;
      });
    }
  });

  // VERSION IMAGE FUNCTION
  ipcRenderer.on('sendImg', (_event, version) => {
    let thumbnail;
    if (version.includes('forge')) {
      thumbnail = 'assets/forge.png';
    } else if (version.includes('fabric')) {
      thumbnail = 'assets/fabric.png';
    } else if (version.includes('OptiFine')) {
      thumbnail = 'assets/optifine.png';
    } else {
      thumbnail = 'assets/vanilla.png';
    }

    $('.version-img').src = thumbnail;
  });

  // GET USER FUNCTION
  ipcRenderer.on('sendUser', (_event, user) => {
    $('#profile-user').innerText = user;
  });

  // GET USERS FUNCTIONS
  ipcRenderer.on('sendUsers', (_event, users, settings) => {
    let $users = $('.users');
    if (settings === 'settings') {
      $users = $('.users-list');
    }
    users.unshift('Crear Usuario');
    if ($users.children.length === 0) {
      users.forEach((element) => {
        if (element === 'Crear Usuario') {
          $users.innerHTML += `<div class='${
            settings === 'settings' ? 'settings-name' : 'name'
          }' id='create-user'>${element}</div>`;
        } else {
          $users.innerHTML += `<div class='${
            settings === 'settings' ? 'settings-name' : 'name'
          }'>${element}</div>`;
        }
      });
    }
  });

  // GET DATA ABOUT THE GAME
  const playingContainer = $('.playing-container');
  const playingText = $('.playing-text');
  ipcRenderer.on('debug', (_event, data) => {
    if (data.includes('INICIANDO MINECRAFT')) {
      playingText.textContent = 'INICIANDO MINECRAFT...';
    } else if (data.toLowerCase().includes('setting user')) {
      playingText.textContent = 'INICIANDO USUARIO...';
    } else if (data.toLowerCase().includes('lwjgl version')) {
      playingText.textContent = 'MINECRAFT INICIADO';
      setInterval(() => {
        playingContainer.classList.add('hidden');
      }, 3000);
    } else if (data.includes('Minecraft Crash Report')) {
      playingContainer.style.background = 'red';
      setInterval(() => {
        playingContainer.classList.add('hidden');
      }, 3000);
    }
  });

  // SETTINGS PAGE
  // SETTINGS CONSTANTS
  const rootBox = $('.rootbox');
  const minBox = $('#min');
  const maxBox = $('#max');
  const java8 = $('#java8');
  const java = $('#java');

  // SETTING CONFIGS
  ipcRenderer.on('sendSettings', (_event, mainRoot, minMem, maxMem, java8Root, javaRoot) => {
    rootBox.innerText = mainRoot;
    minBox.innerText = minMem;
    maxBox.innerText = maxMem;
    java8.innerText = java8Root;
    java.innerText = javaRoot;
  });

  // CONFIG GAME ROOT
  ipcRenderer.on('changeRoot', (_event, option, dir) => {
    switch (option) {
      case 'main':
        rootBox.innerText = dir;
        break;

      case 'java8':
        java8.innerText = dir;
        break;

      case 'java':
        java.innerText = dir;
        break;
    }
  });

  // CONFIG MIN MEMORY
  ipcRenderer.on('changeMin', (_event, val) => {
    minBox.innerText = val;
  });

  // CONFIG MAX MEMORY
  ipcRenderer.on('changeMax', (_event, val) => {
    maxBox.innerText = val;
  });

  // CREATE NEW USER
  ipcRenderer.on('newUser', (event, user, repeated) => {
    $('#profile-user').innerText = user;
    if (!repeated) {
      $('.users').innerHTML += `<div class='name'>${user}</div>`;
    }
  });

  // ERROR SAVE MEMORY
  ipcRenderer.on('memoriesError', (event) => {
    alert('No se pueden ajustar las memorias a esa cantidad');
  });

  // SAVE
  ipcRenderer.on('succesSaveSettings', (event) => {
    alert('Ajustes guardados correctamente');
  });

  // ALL PAGES
  // DOWNLOAD BAR CONSTANTS
  const $downloadBar = $('.progress-container');
  const $progressText = $('.progress-text');
  const $progressBar = $('.progress-bar');

  // DOWNLOAD BAR
  ipcRenderer.on('percentDownloaded', (_event, percent) => {
    if ($downloadBar.classList.contains('hidden')) {
      $downloadBar.classList.remove('hidden');
    }
    percent = percent.split(' ')[0];
    $progressText.textContent = percent;
    $progressText.style.left = '45%';
    $progressBar.style.width = percent;
    if (percent === 'Instalando...') {
      $progressBar.style.width = '100%';
      $progressText.style.left = '38%';
    }
  });

  // VERSIONS PAGE
  // VERSION DOWNLOADED EVENT
  ipcRenderer.on('versionDownloaded', () => {
    alert('Version Downloaded');
    location.reload();
  });

  // VERSION DOWNLOADING EVENT
  ipcRenderer.on('versionDownloading', (_event) => {
    $downloadBar.classList.toggle('hidden');
  });

  // GET ALL AVAILABLE VERSIONS
  ipcRenderer.on('sendVersionsPages', (_event, versions) => {
    const container = $('.versions');
    versions.forEach((version) => {
      container.innerHTML += `<div class='version'>${version.id}</div>`;
    });
  });

  // ALL FUNCTIONS WITH DOM
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
    changeRoot: (option) => ipcRenderer.send('changeRoot', option),
    input: (opt) => ipcRenderer.send('input', opt),
    saveSettings: (newRoot, newMin, newMax) =>
      ipcRenderer.send('saveSettings', newRoot, newMin, newMax),
    delete: (element, type) => ipcRenderer.send('delete', element, type),
    // VERSIONS PAGE
    getVersionsPages: () => ipcRenderer.send('getVersionsPages'),
    downloadVersion: (version) => ipcRenderer.send('downloadVersion', version),
  });
});
