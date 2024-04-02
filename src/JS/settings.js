addEventListener('DOMContentLoaded', () => {

  const $ = selector => document.querySelector(selector);
  const $$ = selector => document.querySelectorAll(selector);

  const $home = $('#home');
  const $root = $('.rootbox');
  const $min = $('#min');
  const $max = $('#max');
  const $save = $('#save');
  const $versionConfig = $('#versions-config');
  const $usersConfig = $('#users-config');
  const $usersList = $('.users-list');
  const $versions = $('.versions');
  const $changelogs = $('#changelogs');
  const $versionsPage = $('#versions');

  $home.addEventListener('click', () => {
    document.location.href = '../index.html';
  });

  $changelogs.addEventListener('click', () => {
    document.location.href = 'changelogs.html';
  });

  $versionsPage.addEventListener('click', () => {
    document.location.href = 'versions.html';
  });

  $root.addEventListener('click', () => {
    window.adlauncher.changeRoot();
  });

  $min.addEventListener('click', () => {
    window.adlauncher.input('min');
  });

  $max.addEventListener('click', () => {
    window.adlauncher.input('max');
  });

  $save.addEventListener('click', () => {
    const newRoot = $root.textContent;
    const newMin = $min.textContent;
    const newMax = $max.textContent;
    window.adlauncher.saveSettings(newRoot, newMin, newMax);
  });

  $versionConfig.addEventListener('click', () => {
    window.adlauncher.getVersions();
    $versions.classList.toggle('hidden');
    $('#selector-versions').classList.toggle('rotate');
    setTimeout(() => {
      $$('.version').forEach(element => {
        if(!element.contains(element.querySelector('.delete'))) {
          element.innerHTML += `<div class='delete'>-</div>`
        }
      });
    }, 10);
  });
  
  $usersConfig.addEventListener('click', () => {
    window.adlauncher.getUsers('settings');
    $usersList.classList.toggle('hidden');
    $('#selector-users').classList.toggle('rotate');
    setTimeout(() => {
      $$('.settings-name').forEach(element => {
        if(!element.contains(element.querySelector('.delete'))) {
          element.innerHTML += `<div class='delete'>-</div>`
        }
      });
      if((window.innerHeight - $usersList.getBoundingClientRect().bottom) < 38) {
        $usersList.style.bottom = '33vh'
      }
    }, 10);
  });

  document.addEventListener('click', () => {
    if(!$versions.classList.contains('hidden')) {
      setTimeout(() => {
        versionpar();
      }, 10)
    }
    if(!$usersConfig.classList.contains('hidden')) {
      setTimeout(() => {
        usersConfigPar();
      }, 10);
    }
  });

  function manejarClic() {
    this.parentNode.remove();
    this.removeEventListener('click', manejarClic);
    window.adlauncher.delete(this.parentNode.textContent.replace('-', ''), 'version');
  }

  function versionpar() {
    const $delete = $versions.querySelectorAll('.delete');
    $delete.forEach(element => {
      element.addEventListener('click', manejarClic);
    });
  }

  function clickManager() {
    this.parentNode.remove();
    this.removeEventListener('click', clickManager);
    window.adlauncher.delete(this.parentNode.textContent.replace('-', ''), 'user');
  }

  function usersConfigPar() {
    const $delete = $usersList.querySelectorAll('.delete');
    $delete.forEach(element => {
      element.addEventListener('click', clickManager);
    });
  }

  window.adlauncher.getSettings();
});