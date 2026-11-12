const { app, BrowserWindow, session, shell, Menu, dialog, net } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

const APP_DIR = path.join(__dirname, 'src');

// Vrai si l'adresse désigne un fichier de l'application elle-même
function isAppUrl(url) {
  try {
    const u = new URL(url);
    if (u.protocol !== 'file:') return false;
    const p = path.normalize(decodeURIComponent(u.pathname).replace(/^\/([A-Za-z]:)/, '$1'));
    return p.toLowerCase().startsWith(APP_DIR.toLowerCase() + path.sep);
  } catch { return false; }
}

// N'ouvre dans le navigateur que les adresses https (jamais file:, smb:, ms-… ni autre protocole)
function openSafe(url) {
  try {
    if (new URL(url).protocol === 'https:') shell.openExternal(url);
  } catch {}
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    title: 'Iqra — Apprendre à lire le Coran',
    backgroundColor: '#f5f5f7',
    icon: path.join(__dirname, 'build', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Les liens externes s'ouvrent dans le navigateur par défaut (adresses https uniquement)
  win.webContents.setWindowOpenHandler(({ url }) => {
    openSafe(url);
    return { action: 'deny' };
  });
  // La fenêtre ne quitte jamais l'application : tout autre lien part dans le navigateur
  win.webContents.on('will-navigate', (e, url) => {
    if (!isAppUrl(url)) { e.preventDefault(); openSafe(url); }
  });
  win.webContents.on('will-redirect', (e, url) => {
    if (!isAppUrl(url)) e.preventDefault();
  });

  win.loadFile(path.join(__dirname, 'src', 'index.html'));
  mainWindow = win;
  win.on('closed', () => { if (mainWindow === win) mainWindow = null; });
}

/* ---------- Recherche de mise à jour ----------
   Au démarrage (puis une fois par jour si Iqra reste ouvert), Iqra demande à GitHub
   quelle est la dernière version publiée. Si elle est plus récente, une fenêtre propose
   de télécharger le bon installateur (64 ou 32 bits). Sans Internet, rien ne s'affiche. */
const REPO = 'knfanew-ux/iqra';
const prefsFile = () => path.join(app.getPath('userData'), 'mises-a-jour.json');

function readPrefs() {
  try { return JSON.parse(fs.readFileSync(prefsFile(), 'utf8')); } catch { return {}; }
}
function writePrefs(p) {
  try { fs.writeFileSync(prefsFile(), JSON.stringify(p)); } catch {}
}

// Compare deux numéros de version « 1.6.3 » : renvoie > 0 si a est plus récent que b
function compareVersions(a, b) {
  const pa = String(a).split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b).split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d;
  }
  return 0;
}

function downloadUrl(release, version) {
  if (process.arch === 'ia32') {
    // Le 32 bits est rangé dans le dépôt (dossier windows/), sous la limite de 100 Mo de GitHub
    return `https://github.com/${REPO}/raw/main/windows/Iqra-Setup-${version}-32bits.exe`;
  }
  const asset = (release.assets || []).find((a) => /\.exe$/i.test(a.name) && !/32bits/i.test(a.name));
  return asset ? asset.browser_download_url : release.html_url;
}

let checking = false;
async function checkForUpdate() {
  // Version Microsoft Store : c'est le Store qui installe les mises à jour, rien à proposer ici
  if (process.windowsStore) return;
  if (checking || !mainWindow) return;
  checking = true;
  try {
    const res = await net.fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': `Iqra/${app.getVersion()}` },
    });
    if (!res.ok) return;
    const release = await res.json();
    const latest = String(release.tag_name || '').replace(/^v/i, '');
    if (!latest || compareVersions(latest, app.getVersion()) <= 0) return;

    const prefs = readPrefs();
    if (prefs.ignoree === latest) return;

    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Mise à jour disponible',
      message: `Iqra ${latest} est disponible`,
      detail: `Vous utilisez la version ${app.getVersion()}.\n\n`
        + 'Téléchargez le nouvel installateur, puis lancez-le : il remplace cette version '
        + 'et garde votre progression.',
      buttons: ['Télécharger', 'Plus tard', 'Ignorer cette version'],
      defaultId: 0,
      cancelId: 1,
      noLink: true,
    });
    if (response === 0) openSafe(downloadUrl(release, latest));
    else if (response === 2) writePrefs({ ...prefs, ignoree: latest });
  } catch {
    // Pas de connexion ou GitHub injoignable : on réessaiera plus tard, sans déranger
  } finally {
    checking = false;
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);

  // Autoriser uniquement le micro (pour s'enregistrer et comparer sa récitation)
  session.defaultSession.setPermissionRequestHandler((wc, permission, callback) => {
    callback(permission === 'media' && isAppUrl(wc.getURL()));
  });
  session.defaultSession.setPermissionCheckHandler((wc, permission) => permission === 'media' && !!wc && isAppUrl(wc.getURL()));
  // Aucune page ne peut créer de fenêtre ou de vue web supplémentaire
  app.on('web-contents-created', (_e, contents) => {
    contents.on('will-attach-webview', (ev) => ev.preventDefault());
  });

  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Première vérification quelques secondes après l'ouverture, puis toutes les 24 h
  setTimeout(checkForUpdate, 8000);
  setInterval(checkForUpdate, 24 * 60 * 60 * 1000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
