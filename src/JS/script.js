addEventListener('DOMContentLoaded', () => {
  const $ = selector => document.querySelector(selector);

  const $play = $('#play');
  const $versions = $('.version-selector'); 
  const $settings = $('#settings');

  $settings.addEventListener('click', () => {
    document.location.href = 'pages/settings.html';
  });
  
  $play.addEventListener('click', () => {
    window.adlauncher.play('1.17.1');
  });
  
  $versions.addEventListener('click', () => {
    window.adlauncher.getVersions();
  });
});