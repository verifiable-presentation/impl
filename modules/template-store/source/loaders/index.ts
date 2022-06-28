// source/loaders/index.ts
// Creates the server and registers schemas, plugins and routes with it.

import type { FastifyServerOptions } from 'fastify'

import createServer from 'fastify'

import { plugins } from './plugins.js'
import { schemas } from './schemas.js'
import { routes } from './routes.js'

export const build = (options: FastifyServerOptions) => {
	// Create the Fastify server.
	// @ts-expect-error It's just typescript weirdness.
	const server = createServer(options)

	// Load the schemas, middleware, and the routes.
	server.register(schemas)
	server.register(plugins)
	server.register(routes)

	return server
}
