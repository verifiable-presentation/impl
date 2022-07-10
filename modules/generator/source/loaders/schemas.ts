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
			KeyQuery: {
				type: 'object',
				properties: {
					name: { type: 'string' },
				},
			},
			// eslint-disable-next-line @typescript-eslint/naming-convention
			KeyDto: {
				type: 'object',
				properties: {
					name: { type: 'string' },
					type: {
						enum: ['Ed25519VerificationKey2020'],
					},
				},
				required: ['name', 'type'],
			},
			// eslint-disable-next-line @typescript-eslint/naming-convention
			UpdateKeyDto: {
				type: 'object',
				properties: {
					name: { type: 'string' },
				},
				required: ['name'],
			},
			// eslint-disable-next-line @typescript-eslint/naming-convention
			ApplicationQuery: {
				type: 'object',
				properties: {
					name: { type: 'string' },
				},
			},
			// eslint-disable-next-line @typescript-eslint/naming-convention
			ApplicationDto: {
				type: 'object',
				properties: {
					name: { type: 'string' },
					template: { $ref: 'schemas#/definitions/TemplateConfiguration' },
					renderer: { $ref: 'schemas#/definitions/RendererConfiguration' },
					registry: { $ref: 'schemas#/definitions/RegistryConfiguration' },
					keys: {
						type: 'array',
						items: { $ref: 'schemas#/definitions/WebDid' },
					},
				},
				required: ['name', 'template', 'renderer', 'keys'],
			},
			// eslint-disable-next-line @typescript-eslint/naming-convention
			UpdateApplicationDto: {
				type: 'object',
				properties: {
					name: { type: 'string' },
					template: { $ref: 'schemas#/definitions/TemplateConfiguration' },
					renderer: { $ref: 'schemas#/definitions/RendererConfiguration' },
					registry: { $ref: 'schemas#/definitions/RegistryConfiguration' },
					keys: {
						type: 'array',
						items: { $ref: 'schemas#/definitions/WebDid' },
					},
				},
			},
			// eslint-disable-next-line @typescript-eslint/naming-convention
			PresentationDto: {
				type: 'object',
				properties: {
					credentials: { type: 'array', items: { type: 'object' } },
					output: { type: 'string' },
					holder: { $ref: 'schemas#/definitions/WebDid' },
				},
				required: ['credentials', 'output'],
			},
		},
	})

	server.addSchema({
		$id: 'schemas',
		type: 'object',
		definitions: {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			WebDid: {
				type: 'string',
			},
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Url: {
				type: 'string',
			},
			// eslint-disable-next-line @typescript-eslint/naming-convention
			TemplateConfiguration: {
				type: 'object',
				properties: {
					id: { $ref: 'schemas#/definitions/WebDid' },
				},
				required: ['id'],
			},
			// eslint-disable-next-line @typescript-eslint/naming-convention
			RendererConfiguration: {
				type: 'object',
				properties: {
					api: { $ref: 'schemas#/definitions/WebDid' },
				},
				required: ['api'],
			},
			// eslint-disable-next-line @typescript-eslint/naming-convention
			RegistryConfiguration: {
				type: 'object',
				properties: {
					api: { $ref: 'schemas#/definitions/WebDid' },
				},
				required: ['api'],
			},
		},
	})

	logger.silly('successfully registered schemas')
})
