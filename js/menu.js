/**
 * Builds the app menu template with translated labels.
 *
 * @param {Function} t - Translation function from i18next.
 *
 * @returns {Array}
 */
const getMenuTemplate = (t) => {
	return [
		{
			label: 'StackBox',
			// prettier-ignore
			submenu: [
				{ role: 'about', label: t('menuAbout') },
				{ type: 'separator' },
				{label: t('menuOpenAccessLog'),
					click: (_, focusedWindow) => {
						focusedWindow.webContents.send('menu-open-access-log');
					}
				},
				{
				label: t('menuOpenApacheLog'),
					click: (_, focusedWindow) => {
						focusedWindow.webContents.send('menu-open-apache-log');
					}
				},
				{
					label: t('menuOpenMysqlLog'),
					click: (_, focusedWindow) => {
						focusedWindow.webContents.send('menu-open-mysql-log');
					}
				},
				{ type: 'separator' },
				{ role: 'hide', label: t('menuHide') },
				{ type: 'separator' },
				{ role: 'close', label: t('menuClose') },
				{ role: 'quit', label: t('menuQuit') }
			]
		}
	];
};

// Export
module.exports = { getMenuTemplate };
