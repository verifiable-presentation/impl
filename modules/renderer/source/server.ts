// source/server.ts
// Runs the server on a port.

import { build } from './loaders/index.js'
import { config } from './utilities/config.js'
import { logger } from './utilities/logger.js'

// Create the Fastify server.
const server = build({
	// Use a custom Pino logger.
	logger,
	disableRequestLogging: true,
})
// Bind the server to the specified port.
await server.listen({ port: config.port })

// To infinity and beyond!
logger.info('server ready to receive requests on port %s', config.port)
