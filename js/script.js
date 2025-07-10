document.addEventListener('DOMContentLoaded', function () {
	const menus = ['open-access-log', 'open-apache-log', 'open-mysql-log'];
	const services = ['apache', 'mysql'];
	const tools = ['open-localhost', 'open-phpmyadmin', 'open-vs-code', 'delete-apache-pid'];
	const serviceStartTimes = {};
	const i18nElements = document.querySelectorAll('[data-i18n]');
	const statusBar = document.getElementById('status-bar');
	const buttons = document.querySelectorAll('button');

	/**
	 * Retrieves and applies translation for a single element.
	 *
	 * @param {HTMLElement} element - Element with data-i18n attribute.
	 *
	 * @returns {void}
	 */
	const applyTranslation = (element) => {
		const key = element.dataset.i18n;
		const attr = element.dataset.i18nAttr;

		window.electronAPI.invoke('translate', { key, params: {} }).then((translated) => {
			if (attr) {
				element.setAttribute(attr, translated);
			} else {
				element.textContent = translated;
			}
		});
	};

	/**
	 * Retrieves a translated message for any context.
	 *
	 * @param {string} context - Translation context ('status', 'fail', 'tool', etc.).
	 * @param {string} key - Action or tool key ('start', 'open-localhost', etc.).
	 * @param {Object} [params] Optional. Interpolation variables. Default: {}
	 *
	 * @returns {string}
	 */
	const getTranslation = (context, key, params = {}) => {
		const cap = (str) => str.charAt(0).toUpperCase() + str.slice(1);
		const fmt = (str) => str.replace(/-([a-z])/g, (_, g) => g.toUpperCase());

		const fullKey = `${context}${cap(fmt(key))}`;
		return window.electronAPI.invoke('translate', { key: fullKey, params });
	};

	/**
	 * Converts elapsed time in seconds into a formatted string (HH:MM:SS).
	 *
	 * @param {number} seconds - The elapsed time in seconds.
	 *
	 * @returns {string}
	 */
	const formatUptime = (seconds) => {
		const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
		const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
		const secs = String(seconds % 60).padStart(2, '0');
		return `${hrs}:${mins}:${secs}`;
	};

	/**
	 * Updates the uptime timer text for a given service container.
	 *
	 * @param {string} service - The name of the service (must match element ID).
	 *
	 * @returns {void}
	 */
	const updateUptimeDisplay = (service) => {
		const container = document.getElementById(service);
		if (!container || !serviceStartTimes[service]) return;
		const now = Date.now();
		const elapsed = Math.floor((now - serviceStartTimes[service]) / 1000);
		const timer = container.querySelector('.status-time');
		if (timer) timer.textContent = formatUptime(elapsed);
	};

	/**
	 * Handles service action buttons (start, stop, restart).
	 *
	 * @param {string}      service   - Service name ('apache', 'mysql', etc.).
	 * @param {string}      action    - The action to invoke ('start', 'stop', 'restart').
	 * @param {HTMLElement} container - The DOM element representing the service.
	 *
	 * @returns {void}
	 */
	const handleServiceAction = (service, action, container) => {
		buttons.forEach((btn) => (btn.disabled = true));
		container.dataset.status = 'loading';
		getTranslation('status', action, { service }).then((msg) => {
			statusBar.textContent = msg;
		});

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
			.catch((error) => {
				getTranslation('fail', action, { service }).then((msg) => {
					alert(`${msg}\n\n${error.message}`);
				});
				container.dataset.status = action === 'start' ? 'off' : 'on';
			})
			.finally(() => {
				buttons.forEach((btn) => (btn.disabled = false));
				updateToolBtn();

				setTimeout(() => {
					statusBar.textContent = '';
				}, 500);
			});
	};

	/**
	 * Executes a predefined tool action with proper status messages and button state handling.
	 *
	 * @param {string} tool - The tool action identifier (e.g. 'open-localhost', 'open-vs-code', etc.).
	 *
	 * @returns {void}
	 */
	const handleToolAction = (tool) => {
		buttons.forEach((btn) => (btn.disabled = true));
		getTranslation('tool', `${tool}Action`).then((msg) => {
			statusBar.textContent = msg;
		});

		window.electronAPI
			.invoke(tool)
			.catch((error) => {
				getTranslation('tool', `${tool}Fail`).then((msg) => {
					alert(`${msg}\n\n${error.message}`);
				});
			})
			.finally(() => {
				buttons.forEach((btn) => (btn.disabled = false));
				updateToolBtn();

				setTimeout(() => {
					statusBar.textContent = '';
				}, 1000);
			});
	};

	/**
	 * Sets disabled state of tool button depending on service status.
	 *
	 * @returns {void}
	 */
	const updateToolBtn = () => {
		const apacheIsRunning = document.getElementById('apache')?.dataset.status === 'on';
		const mySqlIsRunning = document.getElementById('mysql')?.dataset.status === 'on';
		const localhostBtn = document.querySelector('[data-action="open-localhost"]');
		const phpmyadminBtn = document.querySelector('[data-action="open-phpmyadmin"]');
		const pidBtn = document.querySelector('[data-action="delete-apache-pid"]');

		localhostBtn.disabled = !apacheIsRunning;
		pidBtn.disabled = apacheIsRunning;
		phpmyadminBtn.disabled = !(apacheIsRunning && mySqlIsRunning);
	};

	// Apply translations
	i18nElements.forEach(applyTranslation);

	// Set up UI and event listeners for each defined menu
	menus.forEach((menu) => {
		window.electronAPI.on(`menu-${menu}`, () => {
			window.electronAPI.invoke(menu).catch((error) => {
				getTranslation('menu', `${menu}Fail`).then((msg) => {
					alert(`${msg}\n\n${error}`);
				});
			});
		});
	});

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

		// Receives service status updates from the main process and updates the UI.
		window.electronAPI.on('status-update', (_, status) => {
			getTranslation('status', 'checking').then((msg) => {
				statusBar.textContent = msg;
			});
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

	// Stop all services and close
	window.electronAPI.on('stop-all-services', async (_, services) => {
		for (const service of services) {
			const container = document.getElementById(service);
			if (container && container.dataset.status === 'on') {
				await new Promise((resolve) => {
					handleServiceAction(service, 'stop', container);
					setTimeout(resolve, 1500);
				});
			}
		}

		window.electronAPI.send('close-app');
	});

	// Updates all service uptime displays every second.
	setInterval(() => {
		services.forEach(updateUptimeDisplay);
	}, 1000);
});
