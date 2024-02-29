addEventListener('DOMContentLoaded', () => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => document.querySelectorAll(selector);

  const $play = $('#play');
  const $settings = $('#settings');
  const $versionSelector = $('.version-selector'); 
  const $versions = $('.versions');
  const $versionsIcon = $('#version-selector');
  const $versionText = $('#version-text');
  const $userText = $('#profile-user');
  const $changelogs = $('#changelogs');
  const $logo = $('#img');

  let version, user;

  $settings.addEventListener('click', () => {
    document.location.href = 'pages/settings.html';
  });

  $changelogs.addEventListener('click', () => {
    document.location.href = 'pages/changelogs.html';
  });
  
  $play.addEventListener('click', () => {
    user = $userText.textContent;
    if(!version || version === 'Descargar Version' || !user) {
      alert('Select a version and user');
    } else {
      window.adlauncher.play(user, version);
    }
  });
  
  $versionSelector.addEventListener('click', () => {
    window.adlauncher.getVersions();
    $versionsIcon.classList.toggle('rotate');
    $versions.classList.toggle('hidden');
    $versions.style.overflow = 'auto';
  });

  document.addEventListener('click', () => {
    if(!$versions.classList.contains('hidden')) {
      setTimeout(() => {
        versionpar();
      }, 10)
    }
  });

  function manejarClic() {
    version = this.textContent;
    $versionText.innerText = version;
    window.adlauncher.getImg(version);
    $versions.classList.toggle('hidden');
    $versionsIcon.classList.toggle('rotate');
    this.removeEventListener('click', manejarClic);
    let vImg = Math.floor(version.split('.')[1]);
    if(!isNaN(vImg) && vImg !== 10 && !version.includes('fabric')) {
      $logo.src = `assets/minecraft-1.${vImg}.jpg`;
    };
  };

  function plpl() {
    window.adlauncher.input('version');
    this.removeEventListener('click', plpl);
  }

  function versionpar() {
    if((window.innerHeight - $versions.getBoundingClientRect().bottom) < 38) {
      $versions.style.bottom = '5vh'
    }
    const $version = $$('.version');
    const $downloadVersion = $('#download-version');
    $downloadVersion.addEventListener('click', plpl);
    $version.forEach(element => {
      element.addEventListener("click", manejarClic);
    });
  }

  // WELCOME
  let modal = $("#welcomeModal");
  let closeBtn = $(".close")[0];

  function hasSeenWelcomeMessage() {
    return localStorage.getItem("welcomeMessageDisplayed");
  }

  function markWelcomeMessageAsSeen() {
    localStorage.setItem("welcomeMessageDisplayed", "true");
  }

  function displayWelcomeMessage() {
    if (!hasSeenWelcomeMessage()) {
      modal.style.display = "block";
      markWelcomeMessageAsSeen();
    }
  }

  window.onload = displayWelcomeMessage;

  closeBtn.onclick = function () {
    modal.style.display = "none";
  }

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
});
