addEventListener('DOMContentLoaded', () => {

  const $ = selector => document.querySelector(selector);

  const $discord = $('#discord');
  const $yt = $('#yt');
  const $github = $('#github');

  $discord.addEventListener('click', () => {
    window.adlauncher.redirect('discord');
  });

  $yt.addEventListener('click', () => {
    window.adlauncher.redirect('yt');
  });

  $github.addEventListener('click', () => {
    window.adlauncher.redirect('github');
  });
});