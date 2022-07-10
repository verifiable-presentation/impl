// tests/integration/api.ts
// The integration test suite.

import type { FastifyInstance } from 'fastify'
import type { TestFn } from 'ava'

import ava from 'ava'

import { fixture } from '../helpers/fixtures.js'

import { build } from '../../source/loaders/index.js'
import { database } from '../../source/provider/database.js'
import { config } from '../../source/utilities/config.js'
import { ServerError } from '../../source/utilities/errors.js'
import { Template } from '../../source/types/api.js'

interface ServerContext {
	server: FastifyInstance
	templates: Template[]
}

const test = ava as TestFn<ServerContext>
const json = JSON

// Create the server before running the tests.
test.before(async (t) => {
	t.context.templates = []
	t.context.server = build({ disableRequestLogging: true })
})
// Cleanup the database after all the tests have run.
test.after(async () => {
	database.data = { templates: [] }
	await database.write()
})

test.serial('get /blah | 404 route-not-found', async (t) => {
	const response = await t.context.server.inject({
		method: 'get',
		url: '/blah',
	})

	const { meta, error, data } = json.parse(response.payload)
	const expectedError = new ServerError('route-not-found')

	// Check that the request failed with the expected HTTP status code and
	// error code.
	t.is(meta?.status, expectedError.status)
	t.is(error?.code, expectedError.code)
	// Check that the message is related to the route not existing.
	t.regex(error?.message, /route was not found/)
	// Check that only the `error` and `meta` fields were returned.
	t.is(data, undefined)
})

test.serial(
	'post /templates | 400 improper-payload [invalid renderer]',
	async (t) => {
		const response = await t.context.server.inject({
			method: 'post',
			url: '/templates',
			payload: fixture('invalid-renderer'),
			headers: { 'content-type': 'application/json' },
		})

		const { meta, error, data } = json.parse(response.payload)
		const expectedError = new ServerError('improper-payload')

		// Check that the request failed with the expected HTTP status code and
		// error code.
		t.is(meta?.status, expectedError.status)
		t.is(error?.code, expectedError.code)
		// Check that the message is related to the invalid value of the renderer
		// field.
		t.regex(error?.message, /renderer/)
		// Check that only the `error` and `meta` fields were returned.
		t.is(data, undefined)
	},
)

test.serial('post /templates | 201 created', async (t) => {
	const template = fixture('valid-template')
	const response = await t.context.server.inject({
		method: 'post',
		url: '/templates',
		payload: template,
		headers: { 'content-type': 'application/json' },
	})

	const { meta, error, data } = json.parse(response.payload)

	// Check that the request is successful and that it returns the created
	// template.
	t.is(meta?.status, 201)
	t.is(error, undefined)
	t.deepEqual(data, { id: data.id, ...json.parse(template) })

	// Add the created template to the list of templates the database should
	// include.
	t.context.templates.push(data)

	// Check that the list of templates in the database matches the one in
	// `t.context`.
	t.deepEqual(database.data?.templates, t.context.templates)
})

test.serial('get /templates | 200 okay', async (t) => {
	const response = await t.context.server.inject({
		method: 'get',
		url: '/templates',
	})

	const { meta, error, data } = json.parse(response.payload)

	// Check that the request is successful and that it returns an array
	// containing the one template created so far.
	t.is(meta?.status, 200)
	t.is(error, undefined)
	t.deepEqual(data, t.context.templates)
})

test.serial('get /templates/{id} | 404 entity-not-found', async (t) => {
	const response = await t.context.server.inject({
		method: 'get',
		url: '/templates/dhh',
	})

	const { meta, error, data } = json.parse(response.payload)
	const expectedError = new ServerError('entity-not-found')

	// Check that the request failed with the expected HTTP status code and
	// error code.
	t.is(meta?.status, expectedError.status)
	t.is(error?.code, expectedError.code)
	// Check that the message is related to the template not existing
	t.regex(error?.message, /does not exist/)
	// Check that only the `error` and `meta` fields were returned.
	t.is(data, undefined)
})

test.serial('get /templates/{id} | 200 okay', async (t) => {
	const template = t.context.templates[0]
	const response = await t.context.server.inject({
		method: 'get',
		url: `/templates/${template.id}`,
	})

	const { meta, error, data } = json.parse(response.payload)

	// Check that the request is successful and that it returns the template
	// requested.
	t.is(meta?.status, 200)
	t.is(error, undefined)
	t.deepEqual(data, template)
})

test.serial(
	'get /templates/{id}/did.json | 404 entity-not-found',
	async (t) => {
		const response = await t.context.server.inject({
			method: 'get',
			url: '/templates/dhh/did.json',
		})

		const { meta, error, data } = json.parse(response.payload)
		const expectedError = new ServerError('entity-not-found')

		// Check that the request failed with the expected HTTP status code and
		// error code.
		t.is(meta?.status, expectedError.status)
		t.is(error?.code, expectedError.code)
		// Check that the message is related to the template not existing
		t.regex(error?.message, /does not exist/)
		// Check that only the `error` and `meta` fields were returned.
		t.is(data, undefined)
	},
)

test.serial('get /templates/{id}/did.json | 200 okay', async (t) => {
	const template = t.context.templates[0]
	const response = await t.context.server.inject({
		method: 'get',
		url: `/templates/${template.id}/did.json`,
	})

	const document = json.parse(response.payload)
	const expectedDocument = {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		'@context': ['https://www.w3.org/ns/did/v1'],
		...template,
		id: `did:web:${config.domain}:templates:${template.id}`,
	}

	// Check that the request is successful and that it returns the template
	// requested.
	t.is(response.statusCode, 200)
	t.deepEqual(document, expectedDocument)
})
