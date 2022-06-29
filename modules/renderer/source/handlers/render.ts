// source/handlers/templates.ts
// Controllers for the `/templates` routes.

import type { FastifyRequest, FastifyReply } from 'fastify'
import type { DecoratedFastifyInstance } from '../types/fastify.js'
import type { RenderDto } from '../types/api.js'

import { logger } from '../utilities/logger.js'
import { ServerError } from '../utilities/errors.js'

/**
 * Render the given data using the specified template.
 */
export const render = async (request: FastifyRequest, reply: FastifyReply) => {
	const server = request.server as DecoratedFastifyInstance
	const payload = request.body as RenderDto

	if (payload.template.schema) {
		logger.silly('validating data based on template schema')

		const validate = server.schema.compile(payload.template.schema)
		if (!validate(payload.data)) {
			logger.warn(validate.errors, 'validation of data failed')
			const validationError = validate.errors.at(0)

			// Get a comprehensible message.
			const message = `The data provided was insufficient to render the presentation using the specified template: the 'data' field ${validationError.message}`
			const values = validationError?.params?.allowedValues as
				| string[]
				| undefined
			/* c8 ignore start */
			const addendum =
				typeof values === 'undefined' ? '' : ` (${values?.join(', ')})`
			/* c8 ignore end */

			// Then throw an error.
			throw new ServerError('precondition-failed', message + addendum)
		}

		logger.silly('successfully validated data')
	}

	logger.silly('rendering data using template')

	const renderedOutput = await server.renderer.compile(
		payload.template.template,
		payload.data,
		payload.template.renderer,
		payload.output,
	)

	logger.silly('successfully rendered data')

	reply.code(200)
	return {
		meta: { status: 200 },
		data: renderedOutput,
	}
}
