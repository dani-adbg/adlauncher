addEventListener('DOMContentLoaded', () => {

  const $ = selector => document.querySelector(selector);

  const $home = $('#home');

  $home.addEventListener('click', () => {
    document.location.href = '../index.html';
  });
});