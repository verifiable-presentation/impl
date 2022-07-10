// source/handlers/applications.ts
// Controllers for the `/applications` routes.

import type { FastifyRequest, FastifyReply } from 'fastify'
import type { DecoratedFastifyInstance } from '../types/fastify.js'
import type {
	ApplicationQuery,
	ApplicationDto,
	UpdateApplicationDto,
	PresentationDto,
} from '../types/api.js'

import { logger } from '../utilities/logger.js'
import { generateId } from '../utilities/misc.js'
import { ServerError } from '../utilities/errors.js'

/**
 * Lists all the applications present in the database.
 */
export const list = async (request: FastifyRequest, reply: FastifyReply) => {
	const server = request.server as DecoratedFastifyInstance
	const query = request.query as ApplicationQuery

	logger.silly('fetching application list from database', query.name)

	const apps =
		typeof query.name === 'string'
			? // Find a application that is held by the entity specified in the query.
			  server.database.data!.applications.filter(
					(app) => app.name === query.name,
			  )
			: // Else just return all the applications.
			  server.database.data!.applications

	logger.silly('fetched application list successfully')

	reply.code(200)
	return {
		meta: { status: 200 },
		data: apps,
	}
}

/**
 * Store a application in the database.
 */
export const create = async (request: FastifyRequest, reply: FastifyReply) => {
	const server = request.server as DecoratedFastifyInstance
	const payload = request.body as ApplicationDto

	// Make sure the keys do exist.
	for (const keyId of payload.keys) {
		const keyExists = server.database.data!.keys.find((key) => key.id === keyId)

		if (!keyExists)
			throw new ServerError(
				'entity-not-found',
				`A keypair with the ID ${keyId} was not found.`,
			)
	}

	const id = generateId()
	const app = {
		id,
		...payload,
	}

	logger.silly('storing application in database')

	server.database.data!.applications.push(app)
	await server.database.write()

	// Store the private application in the database, but don't expose it publicly.
	// @ts-expect-error It's just typescript weirdness.
	delete app.private

	logger.silly('stored application with id %s successfully', id)

	reply.code(201)
	return {
		meta: { status: 201 },
		data: app,
	}
}

/**
 * Retrieve a application from the database.
 */
export const get = async (request: FastifyRequest, reply: FastifyReply) => {
	const server = request.server as DecoratedFastifyInstance
	const parameters = request.params as Record<string, string>

	const { applicationId } = parameters

	logger.silly('fetching application %s from database', applicationId)

	const app = server.database.data!.applications.find(
		(app_) => app_.id === applicationId,
	)
	if (!app)
		throw new ServerError(
			'entity-not-found',
			'A application with the specified ID does not exist.',
		)

	// Store the private application in the database, but don't expose it publicly.
	// @ts-expect-error It's just typescript weirdness.
	delete app.private

	logger.silly('fetched application data successfully')

	reply.code(200)
	return {
		meta: { status: 200 },
		data: app,
	}
}

/**
 * Update a application in the database.
 */
export const update = async (request: FastifyRequest, reply: FastifyReply) => {
	const server = request.server as DecoratedFastifyInstance
	const payload = request.body as UpdateApplicationDto
	const parameters = request.params as Record<string, string>

	const id = parameters.applicationId

	logger.silly('updating application %s in database', id)

	// Make sure the keys do exist.
	if (payload.keys)
		for (const keyId of payload.keys) {
			const keyExists = server.database.data!.keys.find(
				(key) => key.id === keyId,
			)

			if (!keyExists)
				throw new ServerError(
					'entity-not-found',
					`A keypair with the ID ${keyId} was not found.`,
				)
		}

	// Check if the application even exists.
	const appIndex = server.database.data!.applications.findIndex(
		(app) => app.id === id,
	)
	if (appIndex === -1)
		throw new ServerError(
			'entity-not-found',
			'A application with the specified ID does not exist.',
		)
	// If it does, replace it at exactly the same position.
	const app = {
		...server.database.data!.applications[appIndex],
		...payload,
	}
	server.database.data!.applications[appIndex] = app
	await server.database.write()

	logger.silly('updated application with id %s successfully', app.id)

	// Store the private application in the database, but don't expose it publicly.
	// @ts-expect-error It's just typescript weirdness.
	delete app.private

	logger.silly('stored application with id %s successfully', id)

	reply.code(200)
	return {
		meta: { status: 200 },
		data: app,
	}
}

/**
 * Delete a application from the database.
 */
export const del = async (request: FastifyRequest, reply: FastifyReply) => {
	const server = request.server as DecoratedFastifyInstance
	const parameters = request.params as Record<string, string>

	const { applicationId } = parameters

	logger.silly('deleting application %s from database', applicationId)

	server.database.data!.applications =
		server.database.data!.applications.filter((app) => app.id !== applicationId)
	await server.database.write()

	logger.silly('deleted application successfully')

	reply.code(200)
	return {
		meta: { status: 204 },
	}
}

/**
 * Issue a verifiable presentation.
 */
export const issue = async (request: FastifyRequest, reply: FastifyReply) => {
	const server = request.server as DecoratedFastifyInstance
	const payload = request.body as PresentationDto
	const parameters = request.params as Record<string, string>

	const { applicationId } = parameters

	logger.silly(
		'issuing verifiable presentation through application %s',
		applicationId,
	)

	const app = server.database.data!.applications.find(
		(app_) => app_.id === applicationId,
	)
	if (!app)
		throw new ServerError(
			'entity-not-found',
			'A application with the specified ID does not exist.',
		)

	const { certificate, presentation } = await server.issuer.issuePresentation(
		app,
		payload.credentials,
		payload.output,
		payload.holder,
	)

	logger.silly('successfully issued presentation')

	reply.code(201)
	return {
		meta: { status: 201 },
		data: { certificate, presentation },
	}
}
