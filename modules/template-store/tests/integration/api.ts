// tests/integration/api.ts
// The integration test suite.

import type { FastifyInstance } from 'fastify'
import type { TestFn } from 'ava'

import ava from 'ava'

import { fixture } from '../helpers/fixtures.js'

import { build } from '../../source/loaders/index.js'
import { database } from '../../source/provider/database.js'
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
	database.data = null
	await database.write()
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

	// Check that the request is successful and that it returns a blank array
	// (since there are no templates in the database yet).
	t.is(meta?.status, 200)
	t.is(error, undefined)
	t.deepEqual(data, t.context.templates)
})

test.serial('get /templates/{id} | 200 okay', async (t) => {
	const template = t.context.templates[0]
	const response = await t.context.server.inject({
		method: 'get',
		url: `/templates/${template.id}`,
	})

	const { meta, error, data } = json.parse(response.payload)

	// Check that the request is successful and that it returns a blank array
	// (since there are no templates in the database yet).
	t.is(meta?.status, 200)
	t.is(error, undefined)
	t.deepEqual(data, template)
})
