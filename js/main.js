const path = require('path');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const { listenStatus, startApache, stopApache, restartApache, startMySQL, stopMySQL, restartMySQL, stopTTyD, openFileInTextEdit, openLocalhost, openPhpMyAdmin, openVSCode, deleteApachePid } = require('./backend');
const { getMenuTemplate } = require('./menu');
const { app, BrowserWindow, ipcMain, Menu } = require('electron');

let mainWindow;
let preventClose = true;

// Hot-reload during development
if (!app.isPackaged) {
	require('electron-reload')(__dirname, {
		electron: require(path.join(__dirname, '..', 'node_modules', 'electron'))
	});
}

/**
 * Initializes i18next in the main process with filesystem backend.
 *
 * @param {string} locale - System locale code.
 *
 * @returns {void}
 */
const initI18n = async (locale) => {
	const lang = locale.split('-')[0] || 'en';

	await i18next.use(Backend).init({
		lng: lang,
		fallbackLng: 'en',
		backend: {
			loadPath: path.join(__dirname, '..', 'locales', '{{lng}}.json')
		},
		interpolation: {
			escapeValue: false
		}
	});
};

/**
 * Creates the main application window with custom styling and settings.
 *
 * @returns {BrowserWindow}
 */
const createWindow = () => {
	const win = new BrowserWindow({
		width: 550,
		height: 370,
		resizable: false,
		maximizable: false,
		titleBarStyle: 'hiddenInset',
		vibrancy: 'ultra-dark',
		transparent: true,
		icon: path.join(__dirname, '..', 'img', 'icon.icns'),
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			nodeIntegration: false
		}
	});

	win.loadFile(path.join(__dirname, '..', 'html', 'index.html'));

	win.on('close', (event) => {
		if (preventClose) {
			event.preventDefault();
			stopAllServices();
		}
	});

	setTimeout(() => {
		startStatusMonitor(win);
	}, 1000);

	if (!app.isPackaged && win && !win.isDestroyed()) {
		win.webContents.openDevTools();
	}

	return win;
};

/**
 * Starts a background interval to monitor the status of all services
 * and emits updates to the renderer process via IPC.
 *
 * @param {BrowserWindow} window - The Electron window to send updates to.
 *
 * @returns {void}
 */
const startStatusMonitor = (window) => {
	// Emit initial status once
	listenStatus((status) => {
		if (window && !window.isDestroyed()) {
			window.webContents.send('status-update', status);
		}
	});

	// Then emit every minute
	setInterval(() => {
		listenStatus((status) => {
			if (window && !window.isDestroyed()) {
				window.webContents.send('status-update', status);
			}
		});
	}, 60000);
};

/**
 * Stops all running services before quitting or closing the app.
 *
 * @returns {void}
 */
const stopAllServices = () => {
	stopTTyD();
	if (mainWindow && typeof mainWindow.isDestroyed === 'function' && !mainWindow.isDestroyed()) {
		mainWindow.webContents.send('stop-all-services', ['apache', 'mysql']);
	}
};

// Handles app ready events
app.whenReady().then(async () => {
	const locale = app.getLocale();
	await initI18n(locale);

	mainWindow = createWindow();
	Menu.setApplicationMenu(Menu.buildFromTemplate(getMenuTemplate(i18next.t)));

	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) {
			mainWindow = createWindow();
		}
	});

	app.on('before-quit', (event) => {
		if (preventClose) {
			event.preventDefault();
			stopAllServices();
		}
	});
});

// IPC handler for close app
ipcMain.on('close-app', () => {
	preventClose = false;
	mainWindow.close();
});

// IPC handler for translations
ipcMain.handle('translate', (_event, args) => {
	const { key, params } = args;
	return i18next.t(key, params || {});
});

// IPC handlers for logs
ipcMain.handle(
	'open-access-log',
	() =>
		new Promise((resolve, reject) => {
			openFileInTextEdit('/Users/danny/Servidor/config/logs/access.log', resolve, reject);
		})
);
ipcMain.handle(
	'open-apache-log',
	() =>
		new Promise((resolve, reject) => {
			openFileInTextEdit('/Users/danny/Servidor/config/logs/apache.log', resolve, reject);
		})
);
ipcMain.handle(
	'open-mysql-log',
	() =>
		new Promise((resolve, reject) => {
			openFileInTextEdit('/Users/danny/Servidor/config/logs/mysql.log', resolve, reject);
		})
);

// IPC handlers for Apache
ipcMain.handle(
	'start-apache',
	() =>
		new Promise((resolve, reject) => {
			startApache(resolve, (errorMessage) => {
				reject(new Error(errorMessage));
			});
		})
);
ipcMain.handle(
	'stop-apache',
	() =>
		new Promise((resolve, reject) => {
			stopApache(resolve, (errorMessage) => {
				reject(new Error(errorMessage));
			});
		})
);
ipcMain.handle(
	'restart-apache',
	() =>
		new Promise((resolve, reject) => {
			restartApache(resolve, reject);
		})
);

// IPC handlers for MySQL
ipcMain.handle(
	'start-mysql',
	() =>
		new Promise((resolve, reject) => {
			startMySQL(resolve, reject);
		})
);
ipcMain.handle(
	'stop-mysql',
	() =>
		new Promise((resolve, reject) => {
			stopMySQL(resolve, reject);
		})
);
ipcMain.handle(
	'restart-mysql',
	() =>
		new Promise((resolve, reject) => {
			restartMySQL(resolve, reject);
		})
);

// IPC handler for tools
ipcMain.handle(
	'open-localhost',
	() =>
		new Promise((resolve, reject) => {
			openLocalhost(resolve, reject);
		})
);
ipcMain.handle(
	'open-phpmyadmin',
	() =>
		new Promise((resolve, reject) => {
			openPhpMyAdmin(resolve, reject);
		})
);
ipcMain.handle(
	'open-vs-code',
	() =>
		new Promise((resolve, reject) => {
			openVSCode(resolve, reject);
		})
);
ipcMain.handle(
	'delete-apache-pid',
	() =>
		new Promise((resolve, reject) => {
			deleteApachePid(resolve, reject);
		})
);
