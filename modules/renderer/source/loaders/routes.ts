// source/loaders/routes.ts
// Loads and registers all the routes for the server.

import type { FastifyInstance } from 'fastify'

import { handlers } from '../handlers/index.js'
import { logger } from '../utilities/logger.js'

/**
 * Registers routes with the passed server instance.
 *
 * @param server The server instance to register the routes with.
 */
export const routes = async (server: FastifyInstance) => {
	logger.silly('registering routes')

	server.post('/render', {
		schema: {
			body: { $ref: 'dtos#/definitions/RenderDto' },
		},
		handler: handlers.render,
	})

	logger.silly('sucessfully registered routes')
}
