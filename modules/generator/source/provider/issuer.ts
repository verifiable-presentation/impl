// source/provider/issuer.ts
// Defines and exports the issuer service used by the server.

import got from 'got'
// @ts-expect-error No type definitions
import { Resolver } from 'did-resolver'
// @ts-expect-error No type definitions
import { getResolver } from 'web-did-resolver'
import { createIssuer } from '@digitalcredentials/sign-and-verify-core'
import type {
	Application,
	Credential,
	OutputFormat,
	Presentation,
	WebDid,
} from '../types/api.js'

import { config } from '../utilities/config.js'
import { ServerError } from '../utilities/errors.js'
import { generateId } from '../utilities/misc.js'
import { database } from './database.js'

// Instantiate a DID resolver.
const webDidResolver = getResolver()
const didResolver = new Resolver({ ...webDidResolver })

// Create an instance of got used to make requests to the renderer and
// the registry.
const fetch = got.extend({
	throwHttpErrors: false,
})

/**
 * Returns a document when given a Web DID.
 *
 * @param {string} did - The Web DID to resolve.
 *
 * @returns {T} The requested document.
 */
const resolveDid = async <T = Record<string, unknown>>(
	did: string,
): Promise<T> => {
	const document = await didResolver.resolve(did)

	if (
		typeof document.didDocument === 'undefined' &&
		document.didResolutionMetadata.error === 'notFound'
	) {
		throw new ServerError('entity-not-found', `Could not resolve DID ${did}.`)
	}

	return document.didDocument as T
}

/**
 * Issues a presentation for a certain application in the specified output
 * format, given a list of credentials.
 *
 * @param {Application} application - The application to use to issue the presentation.
 * @param {Credential[]} credentials - The credentials to derive the presentation from.
 * @param {OutputFormat} output - The format in which to render the presentation.
 *
 * @returns {Presentation} The presentation, as a JSON-LD document and in the rendered form.
 */
const issuePresentation = async (
	app: Application,
	credentials: Credential[],
	output: OutputFormat,
	holder: WebDid,
): Promise<Presentation> => {
	// First, create and sign a presentation.

	// Get the key from the database.
	const keyId = app.keys[0]
	const key = database.data!.keys.find((key) => key.id === keyId)!
	// Create a DID document used to sign the presentation.
	const keyDocument = {
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
				privateKeyMultibase: key.private,
			},
		],
	}
	// @ts-expect-error We only need `authentication` and `assertion` fields in the document.
	const { createAndSignPresentation, sign } = createIssuer([keyDocument])

	// Create and sign the presentation.
	const id = generateId()
	const did = `did:web:${config.domain}:presentations:${id}`
	const presentation = await createAndSignPresentation(
		credentials,
		did,
		holder,
		{
			verificationMethod: `did:web:${config.domain}:keys:${key.id}`,
			challenge: generateId(),
		},
	)

	// Once that is done, render the certificate using the template.
	const templateDid = app.template.id
	const template = await resolveDid(templateDid)
	const renderer = app.renderer.api
	const renderEndpoint = `${renderer}/render`
	const registry = app.registry.api
	const registryEndpoint = `${registry}/presentations`

	// Get the data to render.
	const data = {}
	const dataPieces = credentials.map(
		(credential) => credential.credentialSubject,
	) as Array<Record<string, unknown>>
	for (const dataPiece of dataPieces) {
		Object.assign(data, { ...data, ...dataPiece })
	}

	// Make a call to the render API.
	const { data: certificate, error: renderError } = await fetch(
		renderEndpoint,
		{
			method: 'post',
			json: {
				template,
				data,
				output,
			},
		},
	).json()
	if (renderError) throw new ServerError(renderError.code, renderError.message)

	// Also store the created presentation in the registry.
	const { error: registryError } = await fetch(registryEndpoint, {
		method: 'post',
		json: presentation,
	}).json()
	if (registryError)
		throw new ServerError(registryError.code, registryError.message)

	// Return the rendered certificate and presentation.
	return {
		certificate,
		presentation,
	}
}

// Export the functions above as the `issuer` service.
export const issuer = { resolveDid, issuePresentation }
