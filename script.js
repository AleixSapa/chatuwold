const loginScreen = document.getElementById('loginScreen');
const agreementScreen = document.getElementById('agreementScreen');
const homeScreen = document.getElementById('homeScreen');
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const rememberInput = document.getElementById('remember');
const loginMessage = document.getElementById('loginMessage');
const agreementStatus = document.getElementById('agreementStatus');
const acceptButton = document.getElementById('acceptButton');
const logoutButton = document.getElementById('logoutButton');
const welcomeTitle = document.getElementById('welcomeTitle');

const rememberedUsername = localStorage.getItem('chatuwold_username');
if (rememberedUsername) {
  usernameInput.value = rememberedUsername;
  rememberInput.checked = true;
}

function showScreen(screen) {
  [loginScreen, agreementScreen, homeScreen].forEach((element) => {
    element.classList.add('hidden');
  });
  screen.classList.remove('hidden');
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    loginMessage.textContent = 'Omple tots els camps.';
    return;
  }

  if (rememberInput.checked) {
    localStorage.setItem('chatuwold_username', username);
  } else {
    localStorage.removeItem('chatuwold_username');
  }

  loginMessage.textContent = '';
  showScreen(agreementScreen);
});

acceptButton.addEventListener('click', () => {
  agreementStatus.textContent = 'Has acceptat. Esperant l’altra persona…';
  acceptButton.disabled = true;
  acceptButton.textContent = 'Acceptat';

  // La sincronització real entre els dos dispositius s'afegirà amb backend.
});

logoutButton.addEventListener('click', () => {
  passwordInput.value = '';
  acceptButton.disabled = false;
  acceptButton.textContent = 'Acceptar';
  agreementStatus.textContent = 'Esperant l’altra persona…';
  welcomeTitle.textContent = 'Benvingut/da a ChatuWold!';
  showScreen(loginScreen);
});
