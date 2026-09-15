let db;
let currentUser = null;
let SQL;

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
const homeLogoutButton = document.getElementById('homeLogoutButton');
const welcomeTitle = document.getElementById('welcomeTitle');
const myName = document.getElementById('myName');
const myDot = document.getElementById('myDot');
const otherDot = document.getElementById('otherDot');

const DB_KEY = 'chatuwold_sqlite_database';
const USER_KEY = 'chatuwold_username';
const FIXED_USERS = { Aleix: '010914', Mat: 'Barça' };

async function startDatabase() {
  SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/${file}` });
  const saved = localStorage.getItem(DB_KEY);
  db = saved ? new SQL.Database(new Uint8Array(JSON.parse(saved))) : new SQL.Database();

  db.run(`CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    accepted INTEGER NOT NULL DEFAULT 0
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    unlocked INTEGER NOT NULL DEFAULT 0
  )`);
  db.run('INSERT OR IGNORE INTO app_state (id, unlocked) VALUES (1, 0)');

  for (const [username, password] of Object.entries(FIXED_USERS)) {
    const passwordHash = await hashPassword(password);
    db.run('INSERT OR IGNORE INTO users (username, password_hash, accepted) VALUES (?, ?, 0)', [username, passwordHash]);
  }
  saveDatabase();
}

function saveDatabase() {
  localStorage.setItem(DB_KEY, JSON.stringify(Array.from(db.export())));
}

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function getUser(username) {
  const result = db.exec('SELECT username, password_hash, accepted FROM users WHERE username = ?', [username]);
  if (!result.length || !result[0].values.length) return null;
  const [name, passwordHash, accepted] = result[0].values[0];
  return { username: name, passwordHash, accepted: Boolean(accepted) };
}

function bothApproved() {
  const result = db.exec('SELECT accepted FROM users WHERE username IN (?, ?)', ['Aleix', 'Mat']);
  const users = result.length ? result[0].values : [];
  return users.length === 2 && users.every(row => Boolean(row[0]));
}

function showScreen(screen) {
  [loginScreen, agreementScreen, homeScreen].forEach(el => el.classList.add('hidden'));
  screen.classList.remove('hidden');
}

function openHome() {
  db.run('UPDATE app_state SET unlocked = 1 WHERE id = 1');
  saveDatabase();
  welcomeTitle.textContent = `Benvingut/da, ${currentUser}!`;
  showScreen(homeScreen);
}

function showPendingApproval() {
  loginMessage.textContent = 'La teva confirmació ja s’ha enviat. Quan els dos ho hàgiu aprovat, podràs entrar.';
}

loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  loginMessage.textContent = '';

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!FIXED_USERS[username]) {
    loginMessage.textContent = 'L’usuari ha de ser Aleix o Mat.';
    return;
  }
  if (!password) return;

  const passwordHash = await hashPassword(password);
  const existing = getUser(username);
  if (!existing || existing.passwordHash !== passwordHash) {
    loginMessage.textContent = 'Usuari o contrasenya incorrectes.';
    return;
  }

  currentUser = username;

  if (bothApproved()) {
    openHome();
    return;
  }

  if (existing.accepted) {
    showPendingApproval();
    return;
  }

  if (rememberInput.checked) localStorage.setItem(USER_KEY, username);
  else localStorage.removeItem(USER_KEY);

  myName.textContent = currentUser;
  agreementStatus.textContent = 'Cal que confirmis la teva entrada abans de continuar.';
  myDot.classList.add('waiting');
  otherDot.classList.add('waiting');
  acceptButton.disabled = false;
  acceptButton.textContent = 'Acceptar';
  showScreen(agreementScreen);
});

acceptButton.addEventListener('click', () => {
  if (!currentUser) return;

  db.run('UPDATE users SET accepted = 1 WHERE username = ?', [currentUser]);
  saveDatabase();

  currentUser = null;
  passwordInput.value = '';
  showScreen(loginScreen);
  loginMessage.textContent = 'S’ha enviat la confirmació de nou usuari. Torna a entrar quan els dos ho hàgiu aprovat.';
});

function logout() {
  currentUser = null;
  passwordInput.value = '';
  showScreen(loginScreen);
}

logoutButton.addEventListener('click', logout);
homeLogoutButton.addEventListener('click', logout);

(async () => {
  try {
    await startDatabase();
    const remembered = localStorage.getItem(USER_KEY);
    if (remembered && FIXED_USERS[remembered]) {
      usernameInput.value = remembered;
      rememberInput.checked = true;
    }
  } catch (error) {
    loginMessage.textContent = 'No s’ha pogut iniciar SQLite.';
    console.error(error);
  }
})();
