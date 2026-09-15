const loginScreen = document.getElementById('loginScreen');
const waitingScreen = document.getElementById('waitingScreen');
const homeScreen = document.getElementById('homeScreen');
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const acceptButton = document.getElementById('acceptButton');
const acceptStatus = document.getElementById('acceptStatus');
const logoutButton = document.getElementById('logoutButton');
const remember = document.getElementById('remember');

function show(screen) {
  [loginScreen, waitingScreen, homeScreen].forEach((item) => item.classList.add('hidden'));
  screen.classList.remove('hidden');
}

function getAccepted() {
  return localStorage.getItem('bothAccepted') === 'true';
}

function setAccepted(value) {
  localStorage.setItem('bothAccepted', value ? 'true' : 'false');
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    loginMessage.textContent = 'Omple el username i la contrasenya.';
    return;
  }

  loginMessage.textContent = '';
  if (remember.checked) {
    localStorage.setItem('rememberedUsername', username);
  } else {
    localStorage.removeItem('rememberedUsername');
  }

  if (getAccepted()) {
    show(homeScreen);
  } else {
    show(waitingScreen);
  }
});

acceptButton.addEventListener('click', () => {
  setAccepted(true);
  acceptStatus.textContent = 'Acceptat! Esperant que l’altra persona també accepti…';
  acceptButton.disabled = true;

  // Demo local: aquest botó simula que els dos usuaris han acceptat.
  setTimeout(() => show(homeScreen), 800);
});

logoutButton.addEventListener('click', () => {
  show(loginScreen);
  document.getElementById('password').value = '';
});

const rememberedUsername = localStorage.getItem('rememberedUsername');
if (rememberedUsername) {
  document.getElementById('username').value = rememberedUsername;
  remember.checked = true;
}

if (getAccepted()) {
  show(homeScreen);
}
