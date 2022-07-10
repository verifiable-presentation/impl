// source/utilities/misc.ts
// Exports utility functions and wrappers around other libraries.

import { customAlphabet } from 'nanoid'

/**
 * Generates a random 28 long alphanumeric ID.
 *
 * @returns {string}
 */
export const generateId = customAlphabet(
	'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
	28,
)
