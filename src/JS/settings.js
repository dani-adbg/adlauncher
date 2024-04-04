addEventListener('DOMContentLoaded', () => {
  // CONSTANTES
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  const container = $('.settings');
  // BARRA DE OPCIONES
  const $home = $('#home');
  const $changelogs = $('#changelogs');
  const $versionsPage = $('#versions');

  // CONFIGS DE RUTA
  const $root = $('.rootbox');
  const $java8 = $('#java8');
  const $java = $('#java');
  // MEMORY CONFIGS
  const $min = $('#min');
  const $max = $('#max');
  // CONFIGS ICONS
  const $usersIcon = $('#selector-users');
  const $versionsIcon = $('#selector-versions');
  // SELECTOR BOX
  const $usersList = $('.users-list');
  const $versions = $('.versions');

  $home.addEventListener('click', () => {
    document.location.href = '../index.html';
  });

  $changelogs.addEventListener('click', () => {
    document.location.href = 'changelogs.html';
  });

  $versionsPage.addEventListener('click', () => {
    document.location.href = 'versions.html';
  });

  container.addEventListener('click', async (e) => {
    const element = e.target;

    if (element.classList.contains('rootbox')) {
      window.adlauncher.changeRoot(element.id);
    } else if (element.classList.contains('listbox')) {
      if (element.id === 'versions-config') {
        window.adlauncher.getVersions();
        $versionsIcon.classList.toggle('rotate');
        $versions.classList.toggle('hidden');
        $versions.style.top = `${$('#versions-config').getBoundingClientRect().bottom}px`;
        setTimeout(() => {
          $$('.version').forEach((element) => {
            if (!element.contains(element.querySelector('.delete'))) {
              element.innerHTML += `<div class='delete'>-</div>`;
            }
          });
        }, 10);
      } else {
        window.adlauncher.getUsers('settings');
        $usersIcon.classList.toggle('rotate');
        $usersList.classList.toggle('hidden');
        $usersList.style.top = `${$('#users-config').getBoundingClientRect().bottom}px`;
        setTimeout(() => {
          $$('.settings-name').forEach((element) => {
            if (!element.contains(element.querySelector('.delete'))) {
              if ($$('.settings-name').length <= 2) return;
              element.innerHTML += `<div class='delete'>-</div>`;
            }
          });
          if (window.innerHeight - $usersList.getBoundingClientRect().bottom < 38) {
            $usersList.style.bottom = '33vh';
          }
        }, 10);
      }
    } else if (element.classList.contains('memorybox')) {
      if (element.id === 'min') {
        window.adlauncher.input('min');
      } else {
        window.adlauncher.input('max');
      }
    } else if (element.classList.contains('delete')) {
      element.parentNode.remove();
      window.adlauncher.delete(
        element.parentNode.textContent.replace('-', ''),
        element.parentNode.className
      );
    } else if (element.id === 'save') {
      const newRoot = $root.textContent;
      const newMin = $min.textContent;
      const newMax = $max.textContent;
      const newJava8 = $java8.textContent;
      const newJava = $java.textContent;
      window.adlauncher.saveSettings(newRoot, newMin, newMax, newJava8, newJava);
    }
  });

  // GETS ADLAUNCHER SETTINGS
  window.adlauncher.getSettings();
});
