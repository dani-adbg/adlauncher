addEventListener('DOMContentLoaded', async () => {
  const $ = selector => document.querySelector(selector);
  const $home = $('#home');
  const $settings = $('#settings');
  const $versions = $('#versions');

  $home.addEventListener('click', () => {
    window.location.href = '../index.html';
  });

  $settings.addEventListener('click', () => {
    window.location.href = 'settings.html';
  });

  $versions.addEventListener('click', () => {
    window.location.href = 'versions.html';
  });

  await window.adlauncher.getVersionsPages();

  $('.versions').addEventListener('click', e => {
    const element = e.target;
    if(element.className === 'version') {
      if(!$('.progress-container').classList.contains('hidden')) return alert('Ya se está descargando una versión.');
      window.adlauncher.downloadVersion(element.textContent);
    };
  });
});