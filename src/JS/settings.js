addEventListener('DOMContentLoaded', () => {

  const $ = selector => document.querySelector(selector);

  const $home = $('#home');
  const $root = $('.rootbox');
  const $min = $('#min');
  const $max = $('#max');

  $home.addEventListener('click', () => {
    document.location.href = '../index.html';
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

  window.adlauncher.getSettings();
});