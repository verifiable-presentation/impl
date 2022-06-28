// scripts/utilities/logger.js
// Exports a logger for the scripts.

import chalk from 'chalk'

// A colorful logger that the scripts use.
export const logger = {
	title: (text) => console.info(chalk.blue.bold(`=== ${text} ===\n`)),
	info: (...text) => console.info(chalk.cyan.bold('i '), chalk.cyan(...text)),
	success: (...text) =>
		console.info(chalk.green.bold('✔ '), chalk.green(...text)),
	warn: (...text) =>
		console.info(chalk.yellow.bold('! '), chalk.yellow(...text)),
	error: (...text) => console.info(chalk.red.bold('✗ '), chalk.red(...text)),
	end: () => console.log(),
	ask: (text) => `${chalk.magenta.bold('? ')} ${chalk.magenta(text)}: `,
	status: (...text) => chalk.blue.dim(...text),
}
