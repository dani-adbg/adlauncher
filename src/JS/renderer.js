addEventListener('DOMContentLoaded', () => {

  const $ = selector => document.querySelector(selector);
  const $$ = selector => document.querySelectorAll(selector);

  const $discord = $('#discord');
  const $yt = $('#yt');
  const $github = $('#github');
  const $userSelector = $('.profile');
  const $users = $('.users');
  const $userText = $('#profile-user');

  let user;
  window.adlauncher.getUser();

  $users.classList.add('hidden');

  $userSelector.addEventListener('click', () => {
    window.adlauncher.getUsers();
    $users.classList.toggle('hidden');
    $users.style.overflow = 'auto';
  });

  $discord.addEventListener('click', () => {
    window.adlauncher.redirect('discord');
  });

  $yt.addEventListener('click', () => {
    window.adlauncher.redirect('yt');
  });

  $github.addEventListener('click', () => {
    window.adlauncher.redirect('github');
  });

  function clickManager() {
    user = this.textContent;
    $userText.innerText = user;
    $users.classList.toggle('hidden');
    this.removeEventListener('click', clickManager);
  }

  function userPar() {
    const $user = $$('.name');
    const $createUser = $('#create-user');
    $createUser.addEventListener('click', () => {
      window.adlauncher.input('user');
    });
    $user.forEach(element => {
      element.addEventListener('click', clickManager);
    })
  }

  document.addEventListener('click', () => {
    if(!$users.classList.contains('hidden')) {
      setTimeout(() => {
        userPar();
      }, 1)
    }
  })
});