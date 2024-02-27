addEventListener('DOMContentLoaded', () => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => document.querySelectorAll(selector);

  const $play = $('#play');
  const $settings = $('#settings');
  const $versionSelector = $('.version-selector'); 
  const $versions = $('.versions');
  const $versionsIcon = $('#versionSelector');
  const $versionText = $('#version-text');

  let version, user;

  $versions.classList.add('hidden');

  $settings.addEventListener('click', () => {
    document.location.href = 'pages/settings.html';
  });
  
  $play.addEventListener('click', () => {
    if(!version || !user) {
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
      }, 1)
    }
  });

  function manejarClic() {
    version = this.textContent;
    $versionText.innerText = version;
    window.adlauncher.getImg(version);
    $versions.classList.toggle('hidden');
    $versionsIcon.classList.toggle('rotate');
    this.removeEventListener('click', manejarClic);
  }

  function versionpar() {
    const $version = $$('.version');
    const $downloadVersion = $('#download-version');
    $downloadVersion.addEventListener('click', () => {
      window.adlauncher.input('version');
    })
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
