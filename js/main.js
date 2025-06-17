const path = require('path');
const { listenStatus, startApache, stopApache, restartApache, startMySQL, stopMySQL, restartMySQL, stopTTyD, openLocalhost, openPhpMyAdmin, openNotionApp, deleteApachePid } = require('./backend');
const { menuTemplate } = require('./menu');
const { app, BrowserWindow, ipcMain, Menu } = require('electron');

globalThis.preventClose = true;

// Hot-reload during development
if (!app.isPackaged) {
	require('electron-reload')(__dirname, {
		electron: require(path.join(__dirname, '..', 'node_modules', 'electron'))
	});
}

/**
 * Creates the main application window with custom styling and settings.
 */
function createWindow() {
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
		if (globalThis.preventClose) {
			event.preventDefault();
			stopAllServices(() => {
				globalThis.preventClose = false;
				win.close();
			});
		}
	});

	setTimeout(() => {
		startStatusMonitor(win);
	}, 1000);

	if (!app.isPackaged && win && !win.isDestroyed()) {
		win.webContents.openDevTools();
	}
}

/**
 * Starts a background interval to monitor the status of all services
 * and emits updates to the renderer process via IPC.
 *
 * @param {BrowserWindow} window - The Electron window to send updates to.
 */
function startStatusMonitor(window) {
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
}

/**
 * Stops all running services before quitting or closing the app.
 *
 * @param {Function} callback - Called after all services are stopped.
 */
function stopAllServices(callback) {
	let pending = 3;

	const done = () => {
		pending--;
		if (pending === 0 && typeof callback === 'function') {
			callback();
		}
	};

	stopApache(done, done);
	stopMySQL(done, done);
	stopTTyD(done, done);
}

// Create window when app is ready
app.whenReady().then(() => {
	createWindow();
	Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
	app.on('before-quit', (event) => {
		if (globalThis.preventClose) {
			event.preventDefault();
			stopAllServices(() => {
				globalThis.preventClose = false;
				app.quit();
			});
		}
	});
});

// Quit app when all windows are closed (except on macOS)
app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit();
});

// IPC handlers for Apache
ipcMain.handle(
	'start-apache',
	() =>
		new Promise((resolve, reject) => {
			startApache(resolve, reject);
		})
);
ipcMain.handle(
	'stop-apache',
	() =>
		new Promise((resolve, reject) => {
			stopApache(resolve, reject);
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
	'open-notion',
	() =>
		new Promise((resolve, reject) => {
			openNotionApp(resolve, reject);
		})
);
ipcMain.handle(
	'delete-apache-pid',
	() =>
		new Promise((resolve, reject) => {
			deleteApachePid(resolve, reject);
		})
);
