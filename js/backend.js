const { exec, spawn } = require('child_process');

/**
 * Checks the running status of Apache and MySQL services.
 * Returns a status object via the callback, indicating which are running.
 *
 * @param {Function} callback - Function to call with the status result.
 *
 * @return {void}
 */
function listenStatus(callback) {
	const checks = {
		apache: 'pgrep httpd',
		mysql: 'pgrep mysqld'
	};

	const status = {};
	const keys = Object.keys(checks);
	let pending = keys.length;

	keys.forEach((key) => {
		exec(checks[key], (err) => {
			status[key] = !err;
			if (--pending === 0) callback(status);
		});
	});
}

/**
 * Executes a start or stop command and verifies the result with repeated checks.
 * Supports both standard command execution and custom function commands.
 *
 * @param {string} service - Name of the service (for logging purposes).
 * @param {string|Function} command - Command path or function to execute.
 * @param {string[]} params - Arguments to pass to the command (ignored if command is a function).
 * @param {string} check - Command to verify service state (e.g., pgrep).
 * @param {'start'|'stop'} action - The expected action ("start" or "stop").
 * @param {Function} onSuccess - Callback on successful verification.
 * @param {Function} onFail - Callback on failure after all attempts.
 * @param {number} [attempts=15] - Max verification attempts.
 * @param {number} [delay=1000] - Delay between attempts in milliseconds.
 *
 * @return {void}
 */
function executeCommand(service, command, params, check, action, onSuccess, onFail, attempts = 15, delay = 1000) {
	let timeoutHandle;

	// Si el comando es una función personalizada, ejecútala
	if (typeof command === 'function') {
		command(); // sin parámetros porque ya está preconfigurado
	} else {
		const start = spawn(command, params, {
			detached: true,
			stdio: 'ignore'
		});
		start.unref();
	}

	const checkService = () => {
		exec(check, (error) => {
			if (action === 'stop' && error) {
				clearTimeout(timeoutHandle);
				return onSuccess({ success: true });
			}
			if (action === 'start' && !error) {
				clearTimeout(timeoutHandle);
				return onSuccess({ success: true });
			}
			if (--attempts > 0) {
				timeoutHandle = setTimeout(checkService, delay);
				return;
			}
			onFail({ success: false, message: `❌ ${service} no ${action} después de ${attempts} intentos` });
		});
	};

	timeoutHandle = setTimeout(checkService, delay);
}

// Apache

/**
 * Starts the Apache service.
 *
 * @param {Function} onSuccess - Callback on success.
 * @param {Function} onFail - Callback on failure.
 *
 * @return {void}
 */
function startApache(onSuccess, onFail) {
	executeCommand(
		'Apache', // nombre del servicio
		'/opt/homebrew/opt/httpd/bin/httpd', // comando
		['-k', 'start'], // parámetros
		'pgrep httpd', // comando de verificación
		'start', // acción
		onSuccess, // callback éxito
		onFail, // callback fallo
		10, // intentos
		1000 // delay entre intentos
	);
}

/**
 * Stops the Apache service by manually killing all httpd processes.
 *
 * @param {Function} onSuccess - Callback on success.
 * @param {Function} onFail - Callback on failure.
 *
 * @return {void}
 */
function stopApache(onSuccess, onFail) {
	executeCommand(
		'Apache',
		() => {
			exec('pgrep httpd', (err, stdout) => {
				if (err || !stdout) return;

				const pids = stdout.trim().split('\n');
				const kill = spawn('kill', ['-9', ...pids], { detached: true, stdio: 'ignore' });
				kill.unref();
			});
		},
		[], // params no se usan si command es función
		'pgrep httpd',
		'stop',
		onSuccess,
		onFail,
		10,
		1000
	);
}

/**
 * Restarts the Apache service.
 *
 * @param {Function} onSuccess - Callback on success.
 * @param {Function} onFail - Callback on failure.
 *
 * @return {void}
 */
function restartApache(onSuccess, onFail) {
	stopApache((res) => {
		if (!res.success) return onFail(res);
		startApache(onSuccess, onFail);
	}, onFail);
}

// MySQL

/**
 * Starts the MySQL service.
 *
 * @param {Function} onSuccess - Callback on success.
 * @param {Function} onFail - Callback on failure.
 *
 * @return {void}
 */
function startMySQL(onSuccess, onFail) {
	executeCommand(
		'MySQL', // nombre del servicio
		'/opt/homebrew/opt/mysql/bin/mysql.server', // comando
		['start'], // parámetros
		'pgrep mysqld', // comando de verificación
		'start', // acción
		onSuccess, // callback éxito
		onFail, // callback fallo
		15, // intentos
		1000 // delay entre intentos
	);
}

/**
 * Stops the MySQL service using pkill.
 *
 * @param {Function} onSuccess - Callback on success.
 * @param {Function} onFail - Callback on failure.
 *
 * @return {void}
 */
function stopMySQL(onSuccess, onFail) {
	executeCommand(
		'MySQL', // nombre del servicio
		'pkill', // comando
		['-f', 'mysqld'], // parámetros
		'pgrep mysqld', // comando de verificación
		'stop', // acción
		onSuccess, // callback éxito
		onFail, // callback fallo
		15, // intentos
		1000 // delay entre intentos
	);
}

/**
 * Restarts the MySQL service.
 *
 * @param {Function} onSuccess - Callback on success.
 * @param {Function} onFail - Callback on failure.
 *
 * @return {void}
 */
function restartMySQL(onSuccess, onFail) {
	stopMySQL((res) => {
		if (!res.success) return onFail(res);
		startMySQL(onSuccess, onFail);
	}, onFail);
}

// TTyD

/**
 * Stops the TTyD service using pkill.
 */
function stopTTyD(onSuccess, onFail) {
	executeCommand(
		'TTyD', // nombre del servicio
		'pkill', // comando
		['-f', 'ttyd'], // parámetros
		'pgrep ttyd', // comando de verificación
		'stop', // acción
		onSuccess, // callback éxito
		onFail, // callback fallo
		5, // intentos
		1000 // delay entre intentos
	);
}

// Tools

/**
 * Opens the Brave browser at https://localhost/dashboard/.
 *
 * @param {Function} onSuccess - Callback on success.
 * @param {Function} onFail - Callback on failure.
 *
 * @return {void}
 */
function openLocalhost(onSuccess, onFail) {
	exec(`open -a "Brave Browser" "https://localhost/dashboard/"`, (error) => {
		if (error) return onFail(error);
		onSuccess();
	});
}

/**
 * Opens phpMyAdmin in Brave at https://localhost/phpmyadmin/.
 *
 * @param {Function} onSuccess - Called on success.
 * @param {Function} onFail - Called on failure.
 *
 * @return {void}
 */
function openPhpMyAdmin(onSuccess, onFail) {
	exec(`open -a "Brave Browser" "https://localhost/phpmyadmin/"`, (error) => {
		if (error) return onFail(error);
		onSuccess();
	});
}

/**
 * Opens the Notion desktop application.
 *
 * @param {Function} onSuccess - Called on successful execution.
 * @param {Function} onFail - Called with an error message if execution fails.
 *
 * @return {void}
 */
function openNotionApp(onSuccess, onFail) {
	exec(`open -a "Notion"`, (error) => {
		if (error) return onFail(error);
		onSuccess();
	});
}

/**
 * Deletes the Apache PID file located at /opt/homebrew/var/run/httpd/httpd.pid
 * and logs the operation result.
 *
 * @param {Function} onSuccess - Callback on success.
 * @param {Function} onFail - Callback on failure.
 * @return {void}
 */
function deleteApachePid(onSuccess, onFail) {
	const pidFile = '/opt/homebrew/var/run/httpd/httpd.pid';
	exec(`cat ${pidFile}`, (err) => {
		if (err) return onFail(`No PID file found at ${pidFile}`);
		exec(`rm -f ${pidFile}`, (rmErr) => {
			if (rmErr) return onFail(rmErr);
			onSuccess();
		});
	});
}

// Exported functions
module.exports = {
	listenStatus,
	startApache,
	stopApache,
	restartApache,
	startMySQL,
	stopMySQL,
	restartMySQL,
	stopTTyD,
	openLocalhost,
	openPhpMyAdmin,
	openNotionApp,
	deleteApachePid
};
