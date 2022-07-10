// source/provider/crypto.ts
// Defines and exports the crypto service used by the server.

// @ts-expect-error No type definitions
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020'

import type { KeyPair, KeyType } from '../types/api.js'

import { ServerError } from '../utilities/errors.js'

/**
 * Generate a key pair of the specified type.
 *
 * @param {KeyType} type - The type of key pair to generate.
 *
 * @returns {Key}
 */
const createKeyPair = async (type: KeyType): Promise<KeyPair> => {
	const pair =
		type === 'Ed25519VerificationKey2020'
			? await Ed25519VerificationKey2020.generate()
			: undefined

	if (!pair)
		throw new ServerError(
			'improper-payload',
			`Invalid key type ${type}, expected 'Ed25519VerificationKey2020'.`,
		)

	const keyData = await pair.export({ publicKey: true, privateKey: true })
	return {
		public: keyData.publicKeyMultibase,
		private: keyData.privateKeyMultibase,
	}
}

// Export the functions above as the `crypto` service.
export const crypto = { createKeyPair }
