document.addEventListener('DOMContentLoaded', function () {
	const services = ['apache', 'mysql'];
	const tools = ['open-localhost', 'open-phpmyadmin', 'open-notion', 'clear-pid'];
	const serviceStartTimes = {};
	const statusBar = document.getElementById('status-bar');
	const buttons = document.querySelectorAll('button');

	/**
	 * Converts elapsed time in seconds into a formatted string (HH:MM:SS).
	 *
	 * @param {number} seconds - The elapsed time in seconds.
	 * @returns {string} - The formatted uptime string.
	 */
	function formatUptime(seconds) {
		const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
		const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
		const secs = String(seconds % 60).padStart(2, '0');
		return `${hrs}:${mins}:${secs}`;
	}

	/**
	 * Updates the uptime timer text for a given service container.
	 *
	 * @param {string} service - The name of the service (must match element ID).
	 */
	function updateUptimeDisplay(service) {
		const container = document.getElementById(service);
		if (!container || !serviceStartTimes[service]) return;
		const now = Date.now();
		const elapsed = Math.floor((now - serviceStartTimes[service]) / 1000);
		const timer = container.querySelector('.status-time');
		if (timer) timer.textContent = formatUptime(elapsed);
	}

	/**
	 * Handles service action buttons (start, stop, restart).
	 *
	 * @param {string} service - Service name ('apache', 'mysql', etc.).
	 * @param {string} action - The action to invoke ('start', 'stop', 'restart').
	 * @param {HTMLElement} container - The DOM element representing the service.
	 */
	function handleServiceAction(service, action, container) {
		const statusMessages = {
			start: `Iniciando ${service}…`,
			stop: `Deteniendo ${service}…`,
			restart: `Reiniciando ${service}…`
		};
		const failMessages = {
			start: `No fue posible iniciar ${service}.`,
			stop: `No fue posible detener ${service}.`,
			restart: `No fue posible reiniciar ${service}.`
		};

		buttons.forEach((btn) => (btn.disabled = true));
		statusBar.textContent = statusMessages[action];
		container.dataset.status = 'loading';

		window.electronAPI
			.invoke(`${action}-${service}`)
			.then(() => {
				container.dataset.status = action === 'stop' ? 'off' : 'on';
				serviceStartTimes[service] = action === 'stop' ? null : Date.now();
				updateUptimeDisplay(service);

				if (action === 'stop') {
					const timer = container.querySelector('.uptime');
					if (timer) timer.textContent = '';
				}
			})
			.catch(() => {
				alert(failMessages[action]);
				container.dataset.status = action === 'start' ? 'off' : 'on';
			})
			.finally(() => {
				buttons.forEach((btn) => (btn.disabled = false));
				updateToolBtn();

				setTimeout(() => {
					statusBar.textContent = '';
				}, 500);
			});
	}

	/**
	 * Executes a predefined tool action with proper status messages and button state handling.
	 *
	 * @param {string} tool - The tool action identifier (e.g. 'open-localhost', 'open-notion', etc.).
	 */
	function handleToolAction(tool) {
		const toolConfig = {
			'open-localhost': {
				actionMessage: 'Abriendo localhost en Brave…',
				failMessage: 'No se pudo abrir localhost en Brave'
			},
			'open-phpmyadmin': {
				actionMessage: 'Abriendo phpMyAdmin en Brave…',
				failMessage: 'No se pudo abrir phpMyAdmin en Brave'
			},
			'open-notion': {
				actionMessage: 'Abriendo la app Notion…',
				failMessage: 'No se pudo abrir la app Notion.'
			},
			'clear-pid': {
				actionMessage: 'Eliminando archivo PID…',
				failMessage: 'No se pudo eliminar el archivo PID.'
			}
		};

		const config = toolConfig[tool];

		buttons.forEach((btn) => (btn.disabled = true));
		statusBar.textContent = config.actionMessage;

		window.electronAPI
			.invoke(tool)
			.catch(() => {
				statusBar.textContent = config.failMessage;
			})
			.finally(() => {
				buttons.forEach((btn) => (btn.disabled = false));
				updateToolBtn();

				setTimeout(() => {
					statusBar.textContent = '';
				}, 1000);
			});
	}

	/**
	 * Sets disabled state of tool button depending on service status.
	 *
	 * @returns {void}
	 */
	function updateToolBtn() {
		const apacheIsRunning = document.getElementById('apache')?.dataset.status === 'on';
		const mySqlIsRunning = document.getElementById('mysql')?.dataset.status === 'on';
		const localhostBtn = document.querySelector('[data-action="open-localhost"]');
		const phpmyadminBtn = document.querySelector('[data-action="open-phpmyadmin"]');
		const pidBtn = document.querySelector('[data-action="clear-pid"]');

		localhostBtn.disabled = !apacheIsRunning;
		pidBtn.disabled = apacheIsRunning;
		phpmyadminBtn.disabled = !(apacheIsRunning && mySqlIsRunning);
	}

	// Set up UI and event listeners for each defined service
	services.forEach((service) => {
		const container = document.getElementById(service);

		if (!container) {
			return;
		}

		const start = container.querySelector('[data-action=start]');
		const restart = container.querySelector('[data-action=restart]');
		const stop = container.querySelector('[data-action=stop]');

		start.addEventListener('click', () => handleServiceAction(service, 'start', container));
		stop.addEventListener('click', () => handleServiceAction(service, 'stop', container));
		restart.addEventListener('click', () => handleServiceAction(service, 'restart', container));

		/**
		 * Receives service status updates from the main process and updates the UI.
		 */
		window.electronAPI.on('status-update', (_, status) => {
			statusBar.textContent = 'Revisando el estado de los servicios…';
			Object.entries(status).forEach(([service, isRunning]) => {
				document.getElementById(service).dataset.status = isRunning ? 'on' : 'off';
				updateToolBtn();
				if (isRunning && !serviceStartTimes[service]) {
					serviceStartTimes[service] = Date.now();
				}
			});

			setTimeout(() => {
				statusBar.textContent = '';
			}, 2000);
		});
	});

	// Set up UI and event listeners for each defined tool
	tools.forEach((tool) => {
		const button = document.querySelector(`[data-action="${tool}"]`);
		button.addEventListener('click', () => {
			button.blur();
			handleToolAction(tool);
		});
	});

	/**
	 * Updates all service uptime displays every second.
	 */
	setInterval(() => {
		services.forEach(updateUptimeDisplay);
	}, 1000);
});
