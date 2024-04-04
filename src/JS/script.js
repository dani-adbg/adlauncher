addEventListener('DOMContentLoaded', () => {
  // CONSTANTES - VARIABLES
  const $ = (selector) => document.querySelector(selector);

  // BARRA DE OPCIONES
  const $changelogs = $('#changelogs');
  const $settings = $('#settings');
  const $versionsPage = $('#versions');
  const $play = $('#play');

  const $versionSelector = $('.version-selector');
  const $versionsIcon = $('#version-selector');
  const $versionText = $('#version-text');
  const $versions = $('.versions');
  const $userText = $('#profile-user');
  const $logo = $('#img');

  let version, user;

  $settings.addEventListener('click', () => {
    document.location.href = 'pages/settings.html';
  });

  $changelogs.addEventListener('click', () => {
    document.location.href = 'pages/changelogs.html';
  });

  $versionsPage.addEventListener('click', () => {
    document.location.href = 'pages/versions.html';
  });

  // FUNCION PARA EJECUTAR EL JUEGO CON EL USUARIO Y LA VERSION INDICADA
  $play.addEventListener('click', () => {
    user = $userText.textContent;
    version = $versionText.textContent;
    if (!version || version === 'Select a Version' || !user) {
      alert('Select a version and user');
    } else {
      $('.playing-container').classList.remove('hidden');
      window.adlauncher.play(user, version);
    }
  });

  // FUNCION PARA DESPLEGAR LA PESTAÑA DE VERSIONES
  $versionSelector.addEventListener('click', () => {
    window.adlauncher.getVersions();
    $versionsIcon.classList.toggle('rotate');
    $versions.classList.toggle('hidden');
    $versions.style.overflow = 'auto';
  });

  // FUNCION PARA SELECCIONAR UNA VERSION
  $versions.addEventListener('click', (e) => {
    const element = e.target;
    if (window.innerHeight - $versions.getBoundingClientRect().bottom < 38) {
      $versions.style.bottom = '5vh';
    }
    if (element.classList.contains('version')) {
      version = element.textContent;
      $versionText.innerText = version;
      window.adlauncher.getImg(version);
      $versions.classList.toggle('hidden');
      $versionsIcon.classList.toggle('rotate');
      let vImg = Math.floor(version.split('.')[1]);
      if (!isNaN(vImg) && vImg !== 10 && !version.includes('fabric')) {
        $logo.src = `assets/minecraft-1.${vImg}.jpg`;
      }
    }
  });
});
