// tests/helpers/fixtures.ts
// Exports a helper function to load fixtures.

import { readFileSync } from 'node:fs'

/**
 * Loads a JSON fixture with the given name from the `tests/fixtures/` folder.
 *
 * @param {string} name - The name of the fixture.
 *
 * @returns {string} The fixture stored in the file.
 */
export const fixture = (name: string): string =>
	readFileSync(`tests/fixtures/${name}.json`, 'utf8')

/**
 * Loads a text fixture with the given name from the `tests/fixtures/` folder.
 *
 * @param {string} name - The name of the fixture.
 *
 * @returns {string} The fixture stored in the file.
 */
export const text = (name: string): string =>
	readFileSync(`tests/fixtures/${name}.txt`, 'utf8')
