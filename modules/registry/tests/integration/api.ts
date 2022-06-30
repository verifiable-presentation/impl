// tests/integration/api.ts
// The integration test suite.

import type { FastifyInstance } from 'fastify'
import type { TestFn } from 'ava'

import ava from 'ava'

import { fixture } from '../helpers/fixtures.js'

import { build } from '../../source/loaders/index.js'
import { database } from '../../source/provider/database.js'
import { ServerError } from '../../source/utilities/errors.js'
import { Presentation } from '../../source/types/api.js'

interface ServerContext {
	server: FastifyInstance
	presentations: Presentation[]
}

const test = ava.serial as TestFn<ServerContext>
const json = JSON

// Create the server before running the tests.
test.before(async (t) => {
	t.context.presentations = []
	t.context.server = build({ disableRequestLogging: true })
})
// Cleanup the database after all the tests have run.
test.after(async () => {
	database.data = { presentations: [] }
	await database.write()
})

test('get /blah | 404 route-not-found', async (t) => {
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

test('post /presentations | 400 improper-payload [invalid proof]', async (t) => {
	const response = await t.context.server.inject({
		method: 'post',
		url: '/presentations',
		payload: fixture('invalid-proof'),
		headers: { 'content-type': 'application/json' },
	})

	const { meta, error, data } = json.parse(response.payload)
	const expectedError = new ServerError('improper-payload')

	// Check that the request failed with the expected HTTP status code and
	// error code.
	t.is(meta?.status, expectedError.status)
	t.is(error?.code, expectedError.code)
	// Check that the message is related to the invalid proof passed.
	t.regex(error?.message, /proof/)
	// Check that only the `error` and `meta` fields were returned.
	t.is(data, undefined)
})

test('post /presentations | 201 created', async (t) => {
	const presentation = fixture('valid-presentation')
	const response = await t.context.server.inject({
		method: 'post',
		url: '/presentations',
		payload: presentation,
		headers: { 'content-type': 'application/json' },
	})

	const { meta, error, data } = json.parse(response.payload)

	// Check that the request is successful and that it returns the created
	// presentation.
	t.is(meta?.status, 201)
	t.is(error, undefined)
	t.deepEqual(data, json.parse(presentation))

	// Add the created presentation to the list of presentations the database should
	// include.
	t.context.presentations.push(data)

	// Check that the list of presentations in the database matches the one in
	// `t.context`.
	t.deepEqual(database.data?.presentations, t.context.presentations)
})

test('get /presentations | 200 okay [lists presentations]', async (t) => {
	const response = await t.context.server.inject({
		method: 'get',
		url: '/presentations',
	})

	const { meta, error, data } = json.parse(response.payload)

	// Check that the request is successful and that it returns an array
	// containing the one presentation created so far.
	t.is(meta?.status, 200)
	t.is(error, undefined)
	t.deepEqual(data, t.context.presentations)
})

test('get /presentations | 200 okay [finds by subject]', async (t) => {
	const presentation = t.context.presentations[0]
	const credential = presentation.verifiableCredential[0]
	const response = await t.context.server.inject({
		method: 'get',
		url: '/presentations',
		query: { subject: credential.credentialSubject.id as string },
	})

	const { meta, error, data } = json.parse(response.payload)

	// Check that the request is successful and that it returns an array
	// containing the one presentation we are searching for.
	t.is(meta?.status, 200)
	t.is(error, undefined)
	t.deepEqual(data, [presentation])
})

test('get /presentations | 200 okay [specified subject does not exist]', async (t) => {
	const response = await t.context.server.inject({
		method: 'get',
		url: '/presentations',
		query: { subject: 'dhh' },
	})

	const { meta, error, data } = json.parse(response.payload)

	// Check that the request is successful and that it returns an empty array.
	t.is(meta?.status, 200)
	t.is(error, undefined)
	t.deepEqual(data, [])
})

test('put /presentations/{id} | 404 entity-not-found', async (t) => {
	const updatedPresentation = fixture('valid-updated-presentation')
	const response = await t.context.server.inject({
		method: 'put',
		url: `/presentations/dhh`,
		payload: updatedPresentation,
		headers: { 'content-type': 'application/json' },
	})

	const { meta, error, data } = json.parse(response.payload)
	const expectedError = new ServerError('entity-not-found')

	// Check that the request failed with the expected HTTP status code and
	// error code.
	t.is(meta?.status, expectedError.status)
	t.is(error?.code, expectedError.code)
	// Check that the message is related to the presentation not existing
	t.regex(error?.message, /does not exist/)
	// Check that only the `error` and `meta` fields were returned.
	t.is(data, undefined)
})

test('put /presentations/{id} | 200 okay', async (t) => {
	const updatedPresentation = json.parse(fixture('valid-updated-presentation'))
	const response = await t.context.server.inject({
		method: 'put',
		url: `/presentations/${updatedPresentation.id}`,
		payload: json.stringify(updatedPresentation),
		headers: { 'content-type': 'application/json' },
	})

	const { meta, error, data } = json.parse(response.payload)

	// Check that the request is successful and that it returns the updated
	// presentation.
	t.is(meta?.status, 200)
	t.is(error, undefined)
	t.deepEqual(data, updatedPresentation)

	// Now the database should only include the updated presentation.
	t.context.presentations[0] = updatedPresentation
	t.deepEqual(database.data?.presentations, t.context.presentations)
})

test('get /presentations/{id} | 404 entity-not-found', async (t) => {
	const response = await t.context.server.inject({
		method: 'get',
		url: '/presentations/dhh',
	})

	const { meta, error, data } = json.parse(response.payload)
	const expectedError = new ServerError('entity-not-found')

	// Check that the request failed with the expected HTTP status code and
	// error code.
	t.is(meta?.status, expectedError.status)
	t.is(error?.code, expectedError.code)
	// Check that the message is related to the presentation not existing
	t.regex(error?.message, /does not exist/)
	// Check that only the `error` and `meta` fields were returned.
	t.is(data, undefined)
})

test('get /presentations/{id} | 200 okay', async (t) => {
	const presentation = t.context.presentations[0]
	const response = await t.context.server.inject({
		method: 'get',
		url: `/presentations/${presentation.id}`,
	})

	const { meta, error, data } = json.parse(response.payload)

	// Check that the request is successful and that it returns the presentation
	// requested.
	t.is(meta?.status, 200)
	t.is(error, undefined)
	t.deepEqual(data, presentation)
})
