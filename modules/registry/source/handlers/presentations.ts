// source/handlers/presentations.ts
// Controllers for the `/presentations` routes.

import type { FastifyRequest, FastifyReply } from 'fastify'
import type { DecoratedFastifyInstance } from '../types/fastify.js'
import type {
	Credential,
	PresentationDto,
	PresentationQuery,
} from '../types/api.js'

import { logger } from '../utilities/logger.js'
import { ServerError } from '../utilities/errors.js'

/**
 * Lists all the presentations present in the database.
 */
export const list = async (request: FastifyRequest, reply: FastifyReply) => {
	const server = request.server as DecoratedFastifyInstance
	const query = request.query as PresentationQuery

	logger.silly('fetching presentation list from database', query.subject)

	const presentations =
		typeof query.subject === 'string'
			? // Find a presentation whose credentials have the ID specified in the query.
			  server.database.data!.presentations.filter((presentation) =>
					presentation.verifiableCredential.some(
						(credential: Credential) =>
							credential.credentialSubject.id === query.subject,
					),
			  )
			: // Else just return all the presentations.
			  server.database.data!.presentations

	logger.silly('fetched presentation list successfully')

	reply.code(200)
	return {
		meta: { status: 200 },
		data: presentations,
	}
}

/**
 * Store a presentation in the database.
 */
export const create = async (request: FastifyRequest, reply: FastifyReply) => {
	const server = request.server as DecoratedFastifyInstance
	const payload = request.body as PresentationDto

	const presentation = payload

	logger.silly('storing presentation in database')

	server.database.data!.presentations.push(presentation)
	await server.database.write()

	logger.silly('stored presentation with id %s successfully', presentation.id)

	reply.code(201)
	return {
		meta: { status: 201 },
		data: presentation,
	}
}

/**
 * Retrieve a presentation from the database.
 */
export const get = async (request: FastifyRequest, reply: FastifyReply) => {
	const server = request.server as DecoratedFastifyInstance
	const parameters = request.params as Record<string, string>

	const { presentationId } = parameters

	logger.silly('fetching presentation %s from database', presentationId)

	const presentation = server.database.data!.presentations.find(
		(presentation) => presentation.id === presentationId,
	)
	if (!presentation)
		throw new ServerError(
			'entity-not-found',
			'A presentation with the specified ID does not exist.',
		)

	logger.silly('fetched presentation data successfully')

	reply.code(200)
	return {
		meta: { status: 200 },
		data: presentation,
	}
}

/**
 * Update a presentation in the database.
 */
export const update = async (request: FastifyRequest, reply: FastifyReply) => {
	const server = request.server as DecoratedFastifyInstance
	const payload = request.body as PresentationDto
	const parameters = request.params as Record<string, string>

	const updatedPresentation = payload
	const updatedPresentationId = parameters.presentationId

	logger.silly('updating presentation %s in database', updatedPresentationId)

	// Check if the presentation even exists.
	const existingPresentationIndex =
		server.database.data!.presentations.findIndex(
			(presentation) => presentation.id === updatedPresentationId,
		)
	if (existingPresentationIndex === -1)
		throw new ServerError(
			'entity-not-found',
			'A presentation with the specified ID does not exist.',
		)
	// If it does, replace it at exactly the same position.
	server.database.data!.presentations[existingPresentationIndex] =
		updatedPresentation
	await server.database.write()

	logger.silly(
		'updated presentation with id %s successfully',
		updatedPresentation.id,
	)

	reply.code(200)
	return {
		meta: { status: 200 },
		data: updatedPresentation,
	}
}
