const { exec, spawn } = require('child_process');

/**
 * Checks the running status of Apache and MySQL services.
 * Returns a status object via the callback, indicating which are running.
 *
 * @param {Function} callback - Function to call with the status result.
 *
 * @returns {void}
 */
const listenStatus = (callback) => {
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
};

/**
 * Executes a start or stop command and verifies the result with repeated checks.
 * Supports both standard command execution and custom function commands.
 *
 * @param {string}          service   - Name of the service (for logging purposes).
 * @param {string|Function} command   - Command path or function to execute.
 * @param {string[]}        params    - Arguments to pass to the command (ignored if command is a function).
 * @param {string}          check     - Command to verify service state (e.g., pgrep).
 * @param {string}          action    - The expected action ("start" or "stop").
 * @param {Function}        onSuccess - Callback on successful verification.
 * @param {Function}        onFail    - Callback on failure after all attempts.
 * @param {number}          attempts  - Max verification attempts. Default 15.
 * @param {number}          delay     - Delay between attempts in milliseconds. Default 1000.
 *
 * @returns {void}
 */
const executeCommand = (service, command, params, check, action, onSuccess, onFail, attempts = 15, delay = 1000) => {
	let timeoutHandle;

	if (typeof command === 'function') {
		command();
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
};

// Apache

/**
 * Starts the Apache service.
 *
 * @param {Function} onSuccess - Callback on success.
 * @param {Function} onFail    - Callback on failure.
 *
 * @returns {void}
 */
const startApache = (onSuccess, onFail) => {
	exec('/opt/homebrew/opt/httpd/bin/httpd -k start', (error, stdout, stderr) => {
		if (error) {
			onFail(stderr || error.message || 'Unknown error');
			return;
		}

		const delay = 1000;
		let attempts = 10;
		let timeoutHandle;

		const checkStatus = () => {
			exec('pgrep httpd', (checkError) => {
				if (!checkError) {
					if (timeoutHandle) clearTimeout(timeoutHandle);
					return onSuccess();
				}

				// Check service
				if (--attempts > 0) {
					timeoutHandle = setTimeout(checkStatus, delay);
				}
				// Stop checking
				else {
					if (timeoutHandle) clearTimeout(timeoutHandle);
					onFail('Apache did not start after many retries.');
				}
			});
		};

		timeoutHandle = setTimeout(checkStatus, delay);
	});
};

/**
 * Stops the Apache service by manually killing all httpd processes.
 *
 * @param {Function} onSuccess - Callback on success.
 * @param {Function} onFail    - Callback on failure.
 *
 * @returns {void}
 */
const stopApache = (onSuccess, onFail) => {
	exec('/opt/homebrew/opt/httpd/bin/httpd -k stop', (error, stdout, stderr) => {
		if (error) {
			onFail(stderr || error.message || 'Unknown error');
			return;
		}

		const delay = 1000;
		let attempts = 10;
		let timeoutHandle;

		const checkStatus = () => {
			exec('pgrep httpd', (checkError) => {
				if (checkError) {
					if (timeoutHandle) clearTimeout(timeoutHandle);
					return onSuccess();
				}

				// Check service
				if (--attempts > 0) {
					timeoutHandle = setTimeout(checkStatus, delay);
				}
				// Stop checking
				else {
					if (timeoutHandle) clearTimeout(timeoutHandle);
					// Try to kill service
					exec('pkill -9 httpd', (pkillError, stdout, pkillStderr) => {
						if (pkillError) {
							onFail(pkillStderr || pkillError.message || 'Unknown error');
							return;
						}
						onSuccess();
					});
				}
			});
		};

		timeoutHandle = setTimeout(checkStatus, delay);
	});
};

/**
 * Restarts the Apache service.
 *
 * @param {Function} onSuccess - Callback on success.
 * @param {Function} onFail    - Callback on failure.
 *
 * @returns {void}
 */
const restartApache = (onSuccess, onFail) => {
	stopApache(
		() => {
			startApache(onSuccess, onFail);
		},
		(error) => {
			onFail(error);
		}
	);
};

// MySQL

/**
 * Starts the MySQL service.
 *
 * @param {Function} onSuccess - Callback on success.
 * @param {Function} onFail    - Callback on failure.
 *
 * @returns {void}
 */
const startMySQL = (onSuccess, onFail) => {
	const start = spawn('/opt/homebrew/opt/mysql/bin/mysql.server', ['start'], {
		detached: true,
		stdio: 'ignore'
	});
	start.unref();

	const delay = 1000;
	let attempts = 10;
	let timeoutHandle;

	const checkStatus = () => {
		exec('pgrep mysqld', (checkError) => {
			if (!checkError) {
				if (timeoutHandle) clearTimeout(timeoutHandle);
				return onSuccess();
			}

			// Check service
			if (--attempts > 0) {
				timeoutHandle = setTimeout(checkStatus, delay);
			}
			// Stop checking
			else {
				if (timeoutHandle) clearTimeout(timeoutHandle);
				onFail('MySQL did not start after many retries.');
			}
		});
	};

	timeoutHandle = setTimeout(checkStatus, delay);
};

/**
 * Stops the MySQL service using pkill.
 *
 * @param {Function} onSuccess - Callback on success.
 * @param {Function} onFail - Callback on failure.
 *
 * @returns {void}
 */
const stopMySQL = (onSuccess, onFail) => {
	const stop = spawn('/opt/homebrew/opt/mysql/bin/mysql.server', ['stop'], {
		detached: true,
		stdio: 'ignore'
	});
	stop.unref();

	const delay = 1000;
	let attempts = 10;
	let timeoutHandle;

	const checkStatus = () => {
		exec('pgrep mysqld', (checkError) => {
			if (checkError) {
				if (timeoutHandle) clearTimeout(timeoutHandle);
				return onSuccess();
			}

			// Check service
			if (--attempts > 0) {
				timeoutHandle = setTimeout(checkStatus, delay);
			}
			// Stop checking
			else {
				if (timeoutHandle) clearTimeout(timeoutHandle);
				// Try to kill service
				exec('pkill -9 mysqld', (pkillError, stdout, pkillStderr) => {
					if (pkillError) {
						onFail(pkillStderr || pkillError.message || 'Unknown error');
						return;
					}
					onSuccess();
				});
			}
		});
	};

	timeoutHandle = setTimeout(checkStatus, delay);
};

/**
 * Restarts the MySQL service.
 *
 * @param {Function} onSuccess - Callback on success.
 * @param {Function} onFail    - Callback on failure.
 *
 * @returns {void}
 */
const restartMySQL = (onSuccess, onFail) => {
	stopMySQL(
		() => {
			startMySQL(onSuccess, onFail);
		},
		(error) => {
			onFail(error);
		}
	);
};

// TTyD

/**
 * Stops the TTyD service using pkill.
 *
 * @returns {void}
 */
const stopTTyD = () => {
	exec('pkill -f ttyd');
};

// Tools

/**
 * Opens a given file path in TextEdit.
 *
 * @param {string}   filePath  - Defines the absolute path to the file.
 * @param {Function} onSuccess - Callback on success.
 * @param {Function} onFail    - Callback on failure.
 *
 * @returns {void}
 */
const openFileInTextEdit = (filePath, onSuccess, onFail) => {
	exec(`open -a TextEdit "${filePath}"`, (error, stdout, stderr) => {
		if (error) {
			onFail(stderr || error.message || 'Unknown error');
			return;
		}
		onSuccess();
	});
};

/**
 * Opens the Brave browser at https://localhost/dashboard/.
 *
 * @param {Function} onSuccess - Callback on success.
 * @param {Function} onFail    - Callback on failure.
 *
 * @returns {void}
 */
const openLocalhost = (onSuccess, onFail) => {
	exec(`open -a "Brave Browser" "https://localhost/dashboard/"`, (error, stdout, stderr) => {
		if (error) {
			onFail(stderr || error.message || 'Unknown error');
			return;
		}
		onSuccess();
	});
};

/**
 * Opens phpMyAdmin in Brave at https://localhost/phpmyadmin/.
 *
 * @param {Function} onSuccess - Called on success.
 * @param {Function} onFail    - Called on failure.
 *
 * @returns {void}
 */
const openPhpMyAdmin = (onSuccess, onFail) => {
	exec(`open -a "Brave Browser" "https://localhost/phpmyadmin/"`, (error, stdout, stderr) => {
		if (error) {
			onFail(stderr || error.message || 'Unknown error');
			return;
		}
		onSuccess();
	});
};

/**
 * Opens the Visual Studio Code application.
 *
 * @param {Function} onSuccess - Called on successful execution.
 * @param {Function} onFail    - Called with an error message if execution fails.
 *
 * @returns {void}
 */
const openVSCode = (onSuccess, onFail) => {
	exec(`open -a "Visual Studio Code"`, (error, stdout, stderr) => {
		if (error) {
			return onFail(stderr || error.message || 'Unknown error');
		}
		onSuccess();
	});
};

/**
 * Deletes the Apache PID file located at /opt/homebrew/var/run/httpd/httpd.pid
 * and logs the operation result.
 *
 * @param {Function} onSuccess - Callback on success.
 * @param {Function} onFail    - Callback on failure.
 *
 * @returns {void}
 */
const deleteApachePid = (onSuccess, onFail) => {
	const pidFile = '/opt/homebrew/var/run/httpd/httpd.pid';

	exec(`cat ${pidFile}`, (error) => {
		if (error) {
			onSuccess();
			return;
		}

		exec(`rm -f ${pidFile}`, (rmError, stdout, rmStderr) => {
			if (rmError) {
				onFail(rmStderr || rmError.message || 'Unknown error');
				return;
			}
			onSuccess();
		});
	});
};

// Export
module.exports = {
	listenStatus,
	startApache,
	stopApache,
	restartApache,
	startMySQL,
	stopMySQL,
	restartMySQL,
	stopTTyD,
	openFileInTextEdit,
	openLocalhost,
	openPhpMyAdmin,
	openVSCode,
	deleteApachePid
};
