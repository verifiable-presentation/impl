// source/handlers/templates.ts
// Controllers for the `/templates` routes.

import type { FastifyRequest, FastifyReply } from 'fastify'
import type { DecoratedFastifyInstance } from '../types/fastify.js'
import type { TemplateDto } from '../types/api.js'

import { logger } from '../utilities/logger.js'
import { generateId } from '../utilities/misc.js'
import { ServerError } from '../utilities/errors.js'

/**
 * Lists all the templates present in the database.
 */
export const list = async (request: FastifyRequest, reply: FastifyReply) => {
	const server = request.server as DecoratedFastifyInstance

	logger.silly('fetching template list from database')

	const templates = [...server.database.data!.templates]

	logger.silly('fetched template list successfully')

	reply.code(200)
	return {
		meta: { status: 200 },
		data: templates,
	}
}

/**
 * Store a template in the database.
 */
export const create = async (request: FastifyRequest, reply: FastifyReply) => {
	const server = request.server as DecoratedFastifyInstance
	const payload = request.body as TemplateDto

	const id = generateId()
	const template = { id, ...payload }

	logger.silly('storing template in database')

	server.database.data!.templates.push(template)
	await server.database.write()

	logger.silly('stored template with id %s successfully', id)

	reply.code(201)
	return {
		meta: { status: 201 },
		data: template,
	}
}

/**
 * Retrieve a template from the database.
 */
export const get = async (request: FastifyRequest, reply: FastifyReply) => {
	const server = request.server as DecoratedFastifyInstance
	const parameters = request.params as Record<string, string>

	const { templateId } = parameters

	logger.silly('fetching template %s from database', templateId)

	const template = server.database.data!.templates.find(
		(template) => template.id === templateId,
	)
	if (!template)
		throw new ServerError(
			'entity-not-found',
			'A template with the specified ID does not exist.',
		)

	logger.silly('fetched template data successfully')

	reply.code(200)
	return {
		meta: { status: 200 },
		data: template,
	}
}
