// source/utilities/logger.ts
// Exports a logger.

import createLogger from 'pino'

import { config } from './config.js'

// The options for the logger.
const options = {
	customLevels: {
		silly: 40,
		info: 50,
		http: 60,
		warn: 70,
		error: 80,
		fatal: 90,
	},
	transport: {
		target: 'pino-pretty',
		options: {
			translateTime: 'SYS:standard',
			ignore: 'pid,hostname',
			customLevels: 'silly:40,info:50,http:60,warn:70,error:80,fatal:90',
			customColors:
				'silly:magenta,info:green,http:blue,warn:yellow,error:red,fatal:red',
		},
	},
	level: 'silly',
	useLevelLabels: true,
	useOnlyCustomLevels: true,
}

// Log colorfully when we are in a development environment, else use the
// standard JSON logger.
/* c8 ignore start */
// @ts-expect-error False positive for error `operand for delete operation must be optional`.
if (config.environment === 'production') delete options.transport
/* c8 ignore end */
// Log only errors in a test environment.
if (config.environment === 'testing') options.level = 'error'

// Export the logger.
// @ts-expect-error It's just typescript weirdness.
export const logger = createLogger(options)
