// source/loaders/schemas.ts
// Registers schemas for everything.

import type { FastifyInstance } from 'fastify'

import pluginify from 'fastify-plugin'

import { logger } from '../utilities/logger.js'

/**
 * Registers the schemas with the passed server instance.
 *
 * @param server The server instance to register the schemas with.
 */
// @ts-expect-error It's just typescript weirdness.
export const schemas = pluginify(async (server: FastifyInstance) => {
	logger.silly('registering schemas')

	server.addSchema({
		$id: 'dtos',
		type: 'object',
		definitions: {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			TemplateDto: {
				type: 'object',
				properties: {
					template: { type: 'string' },
					renderer: { enum: ['ejs'] },
					schema: { type: 'object' },
				},
				required: ['template', 'renderer'],
			},
		},
	})

	logger.silly('successfully registered schemas')
})
