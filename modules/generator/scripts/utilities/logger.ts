// scripts/utilities/logger.js
// Exports a logger for the scripts.

import chalk from 'chalk'

// A colorful logger that the scripts use.
export const logger = {
	title: (text: string) => console.info(chalk.blue.bold(`=== ${text} ===\n`)),
	info: (...text: any[]) =>
		console.info(chalk.cyan.bold('i '), chalk.cyan(...text)),
	success: (...text: any[]) =>
		console.info(chalk.green.bold('✔ '), chalk.green(...text)),
	warn: (...text: any[]) =>
		console.info(chalk.yellow.bold('! '), chalk.yellow(...text)),
	error: (...text: any[]) =>
		console.info(chalk.red.bold('✗ '), chalk.red(...text)),
	end: () => console.log(),
	ask: (text: string) => `${chalk.magenta.bold('? ')} ${chalk.magenta(text)}: `,
	status: (...text: any[]) => chalk.blue.dim(...text),
}
