const { contextBridge, ipcRenderer } = require('electron');

/**
 * Exposes a secure API to the renderer process via the `window.electronAPI` object.
 * This enables controlled communication between the renderer and main processes
 * using Electron's contextBridge and IPC mechanisms.
 *
 * - `invoke`: Sends an asynchronous message and expects a result (returns a Promise).
 * - `send`: Sends a one-way asynchronous message (no response expected).
 * - `on`: Listens for events from the main process.
 */
contextBridge.exposeInMainWorld('electronAPI', {
	invoke: (channel, data) => ipcRenderer.invoke(channel, data),
	send: (channel, data) => ipcRenderer.send(channel, data),
	on: (channel, callback) => ipcRenderer.on(channel, callback),
});
