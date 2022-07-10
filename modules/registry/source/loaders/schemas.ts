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
			PresentationDto: { $ref: 'schemas#/definitions/Presentation' },
			// eslint-disable-next-line @typescript-eslint/naming-convention
			PresentationQuery: {
				type: 'object',
				properties: {
					holder: { $ref: 'schemas#/definitions/WebDid' },
				},
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
			Context: {
				type: 'array',
				items: { oneOf: [{ type: 'object' }, { type: 'string' }] },
			},
			// eslint-disable-next-line @typescript-eslint/naming-convention
			PresentationType: {
				anyOf: [
					{
						enum: ['VerifiablePresentation'],
					},
					{
						type: 'array',
						items: { type: 'string' },
					},
				],
			},
			// eslint-disable-next-line @typescript-eslint/naming-convention
			CredentialType: {
				anyOf: [
					{
						enum: ['VerifiableCredential'],
					},
					{
						type: 'array',
						items: { type: 'string' },
					},
				],
			},
			// eslint-disable-next-line @typescript-eslint/naming-convention
			IsoDateTime: {
				type: 'string',
			},
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Proof: {
				type: 'object',
				properties: {
					type: {
						enum: ['Ed25519Signature2020'],
					},
					created: { $ref: 'schemas#/definitions/IsoDateTime' },
					proofPurpose: { enum: ['authentication', 'assertionMethod'] },
					proofValue: { type: 'string' },
					verificationMethod: { $ref: 'schemas#/definitions/WebDid' },
					challenge: { type: 'string' },
					domain: { type: 'string' },
				},
				required: [
					'type',
					'created',
					'proofPurpose',
					'proofValue',
					'verificationMethod',
				],
			},
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Credential: {
				type: 'object',
				properties: {
					id: { $ref: 'schemas#/definitions/WebDid' },
					// eslint-disable-next-line @typescript-eslint/naming-convention
					'@context': { $ref: 'schemas#/definitions/Context' },
					type: { $ref: 'schemas#/definitions/CredentialType' },
					issuer: { $ref: 'schemas#/definitions/WebDid' },
					issuanceDate: { $ref: 'schemas#/definitions/IsoDateTime' },
					credentialSubject: { type: 'object' },
					proof: { $ref: 'schemas#/definitions/Proof' },
				},
				required: [
					'id',
					'@context',
					'type',
					'issuer',
					'issuanceDate',
					'credentialSubject',
					'proof',
				],
				additionalProperties: true,
			},
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Presentation: {
				type: 'object',
				properties: {
					id: { $ref: 'schemas#/definitions/WebDid' },
					holder: { $ref: 'schemas#/definitions/WebDid' },
					// eslint-disable-next-line @typescript-eslint/naming-convention
					'@context': { $ref: 'schemas#/definitions/Context' },
					type: { $ref: 'schemas#/definitions/PresentationType' },
					verifiableCredential: {
						type: 'array',
						items: { $ref: 'schemas#/definitions/Credential' },
					},
					proof: { $ref: 'schemas#/definitions/Proof' },
				},
				required: [
					'id',
					'holder',
					'@context',
					'type',
					'verifiableCredential',
					'proof',
				],
				additionalProperties: true,
			},
		},
	})

	logger.silly('successfully registered schemas')
})
