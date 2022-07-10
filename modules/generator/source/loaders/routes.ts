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

	server.get('/keys', {
		schema: {
			querystring: { $ref: 'dtos#/definitions/KeyQuery' },
		},
		handler: handlers.keys.list,
	})

	server.post('/keys', {
		schema: {
			body: { $ref: 'dtos#/definitions/KeyDto' },
		},
		handler: handlers.keys.create,
	})

	server.get('/keys/:keyId', {
		handler: handlers.keys.get,
	})

	server.patch('/keys/:keyId', {
		schema: {
			body: { $ref: 'dtos#/definitions/UpdateKeyDto' },
		},
		handler: handlers.keys.update,
	})

	server.delete('/keys/:keyId', {
		handler: handlers.keys.del,
	})

	server.get('/keys/:keyId/did.json', {
		handler: handlers.keys.did,
	})

	server.get('/applications', {
		schema: {
			querystring: { $ref: 'dtos#/definitions/ApplicationQuery' },
		},
		handler: handlers.applications.list,
	})

	server.post('/applications', {
		schema: {
			body: { $ref: 'dtos#/definitions/ApplicationDto' },
		},
		handler: handlers.applications.create,
	})

	server.get('/applications/:applicationId', {
		handler: handlers.applications.get,
	})

	server.patch('/applications/:applicationId', {
		schema: {
			body: { $ref: 'dtos#/definitions/UpdateApplicationDto' },
		},
		handler: handlers.applications.update,
	})

	server.delete('/applications/:applicationId', {
		handler: handlers.applications.del,
	})

	server.post('/applications/:applicationId/issue', {
		schema: {
			body: { $ref: 'dtos#/definitions/PresentationDto' },
		},
		handler: handlers.applications.issue,
	})

	logger.silly('sucessfully registered routes')
}
