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

	server.get('/templates', {
		handler: handlers.templates.list,
	})

	server.post('/templates', {
		schema: {
			body: { $ref: 'dtos#/definitions/TemplateDto' },
		},
		handler: handlers.templates.create,
	})

	server.get('/templates/:templateId', {
		handler: handlers.templates.get,
	})

	logger.silly('sucessfully registered routes')
}
