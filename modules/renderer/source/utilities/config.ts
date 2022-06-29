// source/utilities/config.ts
// Loads and manages configuration for the server.

import { env } from 'node:process'

export const config = {
	// Whether we are in a development environment or not.
	environment: env.NODE_ENV?.toLowerCase().startsWith('prod')
		? 'production'
		: env.NODE_ENV?.toLowerCase().startsWith('test')
		? 'testing'
		: 'development',
	// The port to bind the server to.
	port: Number.parseInt(env.PORT ?? '4242', 10),
}
