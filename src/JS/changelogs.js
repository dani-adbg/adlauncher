addEventListener('DOMContentLoaded', () => {
  const $ = selector => document.querySelector(selector);
  const $home = $('#home');
  const $settings = $('#settings');

  $home.addEventListener('click', () => {
    window.location.href = '../index.html';
  });

  $settings.addEventListener('click', () => {
    window.location.href = 'settings.html';
  });
});