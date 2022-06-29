// tests/integration/api.ts
// The integration test suite.

import type { FastifyInstance } from 'fastify'
import type { TestFn } from 'ava'

import ava from 'ava'

import { fixture, text } from '../helpers/fixtures.js'

import { build } from '../../source/loaders/index.js'
import { ServerError } from '../../source/utilities/errors.js'

interface ServerContext {
	server: FastifyInstance
}

const test = ava as TestFn<ServerContext>
const json = JSON

// Create the server before running the tests.
test.before(async (t) => {
	t.context.server = build({ disableRequestLogging: true })
})

test.serial(
	'post /render | 400 improper-payload [invalid renderer]',
	async (t) => {
		const response = await t.context.server.inject({
			method: 'post',
			url: '/render',
			// Pass a template that requires an unsupported render to be rendered.
			payload: fixture('invalid-renderer'),
			headers: { 'content-type': 'application/json' },
		})

		const { meta, error, data } = json.parse(response.payload)
		const expectedError = new ServerError('improper-payload')

		// Check that the request is successful and that it returns a blank array
		// (since there are no templates in the database yet).
		t.is(meta?.status, expectedError.status)
		t.is(error?.code, expectedError.code)
		// Check that the message is related to the invalid value of the renderer
		// field.
		t.regex(error?.message, /renderer/)
		// Check that only the `error` and `meta` fields were returned.
		t.is(data, undefined)
	},
)

test.serial(
	'post /render | 412 precondition-failed [invalid data]',
	async (t) => {
		const response = await t.context.server.inject({
			method: 'post',
			url: '/render',
			// Pass invalid data to render the template.
			payload: fixture('invalid-data'),
			headers: { 'content-type': 'application/json' },
		})

		const { meta, error, data } = json.parse(response.payload)
		const expectedError = new ServerError('precondition-failed')

		// Check that the request is successful and that it returns a blank array
		// (since there are no templates in the database yet).
		t.is(meta?.status, expectedError.status)
		t.is(error?.code, expectedError.code)
		// Check that the message is related to the invalid data passed.
		t.regex(error?.message, /insufficient/)
		// Check that only the `error` and `meta` fields were returned.
		t.is(data, undefined)
	},
)

test.serial('post /render | 200 okay', async (t) => {
	const response = await t.context.server.inject({
		method: 'post',
		url: '/render',
		payload: fixture('valid-request'),
		headers: { 'content-type': 'application/json' },
	})

	const { meta, error, data } = json.parse(response.payload)

	// Check that the request is successful and that it returns the rendered
	// data.
	t.is(meta?.status, 200)
	t.is(error, undefined)
	t.is(data, text('rendered-output'))
})
