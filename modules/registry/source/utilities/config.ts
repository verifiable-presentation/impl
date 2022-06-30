// source/utilities/config.ts
// Loads and manages configuration for the server.

import { env } from 'node:process'

import { JSONFile } from 'lowdb'

import type { Data } from '../types/database.js'

// Ensure that some variables are present in the environment.
if (!env.DATABASE_FILE_NAME)
	/* c8 ignore next */
	throw new Error('could not start database as $DATABASE_FILE_NAME was not set')

export const config = {
	// Whether we are in a development environment or not.
	/* c8 ignore start */
	environment: env.NODE_ENV?.toLowerCase().startsWith('prod')
		? 'production'
		: env.NODE_ENV?.toLowerCase().startsWith('test')
		? 'testing'
		: 'development',
	/* c8 ignore end */
	// The port to bind the server to.
	port: Number.parseInt(env.PORT ?? '4242', 10),

	// The configuration for the database.
	database: {
		file: env.DATABASE_FILE_NAME!,
		adapter: new JSONFile<Data>(env.DATABASE_FILE_NAME!),
	},
}
