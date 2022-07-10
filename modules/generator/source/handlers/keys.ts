// source/handlers/keys.ts
// Controllers for the `/keys` routes.

import type { FastifyRequest, FastifyReply } from 'fastify'
import type { DecoratedFastifyInstance } from '../types/fastify.js'
import type { KeyQuery, KeyDto, UpdateKeyDto } from '../types/api.js'

import { config } from '../utilities/config.js'
import { logger } from '../utilities/logger.js'
import { generateId } from '../utilities/misc.js'
import { ServerError } from '../utilities/errors.js'

/**
 * Lists all the keys present in the database.
 */
export const list = async (request: FastifyRequest, reply: FastifyReply) => {
	const server = request.server as DecoratedFastifyInstance
	const query = request.query as KeyQuery

	logger.silly('fetching key list from database', query.name)

	const keys =
		typeof query.name === 'string'
			? // Find a key that is held by the entity specified in the query.
			  server.database.data!.keys.filter((key) => key.name === query.name)
			: // Else just return all the keys.
			  server.database.data!.keys

	logger.silly('fetched key list successfully')

	reply.code(200)
	return {
		meta: { status: 200 },
		data: keys,
	}
}

/**
 * Store a key in the database.
 */
export const create = async (request: FastifyRequest, reply: FastifyReply) => {
	const server = request.server as DecoratedFastifyInstance
	const payload = request.body as KeyDto

	const id = generateId()
	const pair = await server.crypto.createKeyPair(payload.type)
	const created = new Date().toISOString()
	const key = {
		id,
		...payload,
		created,
		...pair,
	}

	logger.silly('storing key in database')

	server.database.data!.keys.push(key)
	await server.database.write()

	// Store the private key in the database, but don't expose it publicly.
	const { private: _, ...details } = key

	logger.silly('stored key with id %s successfully', id)

	reply.code(201)
	return {
		meta: { status: 201 },
		data: details,
	}
}

/**
 * Retrieve a key from the database.
 */
export const get = async (request: FastifyRequest, reply: FastifyReply) => {
	const server = request.server as DecoratedFastifyInstance
	const parameters = request.params as Record<string, string>

	const { keyId } = parameters

	logger.silly('fetching key %s from database', keyId)

	const key = server.database.data!.keys.find((key) => key.id === keyId)
	if (!key)
		throw new ServerError(
			'entity-not-found',
			'A key with the specified ID does not exist.',
		)

	// Store the private key in the database, but don't expose it publicly.
	const { private: _, ...details } = key

	logger.silly('fetched key data successfully')

	reply.code(200)
	return {
		meta: { status: 200 },
		data: details,
	}
}

/**
 * Update a key in the database.
 */
export const update = async (request: FastifyRequest, reply: FastifyReply) => {
	const server = request.server as DecoratedFastifyInstance
	const payload = request.body as UpdateKeyDto
	const parameters = request.params as Record<string, string>

	const id = parameters.keyId

	logger.silly('updating key %s in database', id)

	// Check if the key even exists.
	const keyIndex = server.database.data!.keys.findIndex((key) => key.id === id)
	if (keyIndex === -1)
		throw new ServerError(
			'entity-not-found',
			'A key with the specified ID does not exist.',
		)
	// If it does, replace it at exactly the same position.
	const key = {
		...server.database.data!.keys[keyIndex],
		name: payload.name,
	}
	server.database.data!.keys[keyIndex] = key
	await server.database.write()

	logger.silly('updated key with id %s successfully', key.id)

	// Store the private key in the database, but don't expose it publicly.
	const { private: _, ...details } = key

	logger.silly('stored key with id %s successfully', id)

	reply.code(200)
	return {
		meta: { status: 200 },
		data: details,
	}
}

/**
 * Delete a key from the database.
 */
export const del = async (request: FastifyRequest, reply: FastifyReply) => {
	const server = request.server as DecoratedFastifyInstance
	const parameters = request.params as Record<string, string>

	const { keyId } = parameters

	logger.silly('deleting key %s from database', keyId)

	// First, ensure no application is currently using it.
	const appUsingKey = server.database.data!.applications.find((app) =>
		app.keys.includes(keyId),
	)
	if (appUsingKey) {
		logger.warn(
			'cannot delete key %s as it is being used by application %s',
			keyId,
			appUsingKey.id,
		)

		throw new ServerError(
			'precondition-failed',
			`This key is being used by the application ${appUsingKey.name}. Please unlink the key from the application before deleting it.`,
		)
	}

	// If not, delete away!
	server.database.data!.keys = server.database.data!.keys.filter(
		(key) => key.id !== keyId,
	)
	await server.database.write()

	logger.silly('deleted key successfully')

	reply.code(200)
	return {
		meta: { status: 204 },
	}
}

/**
 * Returns a DID document for the specified key.
 */
export const did = async (request: FastifyRequest, reply: FastifyReply) => {
	const server = request.server as DecoratedFastifyInstance
	const parameters = request.params as Record<string, string>

	const { keyId } = parameters

	logger.silly('fetching key %s from database', keyId)

	const key = server.database.data!.keys.find((key) => key.id === keyId)
	if (!key)
		throw new ServerError(
			'entity-not-found',
			'A key with the specified ID does not exist.',
		)

	logger.silly('fetched key data successfully')

	logger.silly('exporting key as did document')

	const document = {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		'@context': [
			'https://www.w3.org/ns/did/v1',
			'https://w3id.org/security/suites/ed25519-2020/v1',
		],
		id: `did:web:${config.domain}:keys:${key.id}`,
		authentication: [
			{
				id: `did:web:${config.domain}:keys:${key.id}`,
				type: key.type,
				controller: `did:web:${config.domain}`,
				publicKeyMultibase: key.public,
				privateKeyMultibase: key.private,
			},
		],
		assertionMethod: [
			{
				id: `did:web:${config.domain}:keys:${key.id}`,
				type: key.type,
				controller: `did:web:${config.domain}`,
				publicKeyMultibase: key.public,
			},
		],
	}

	logger.info('succesfully exported key as did document')

	reply.code(200)
	reply.header('content-type', 'application/ld+json')
	return document
}
