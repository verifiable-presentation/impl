// source/types/database.d.ts
// The type definitions for the JSON database.

import type { Key, Application } from './api.js'

/**
 * The data stored in the database.
 */
export declare interface Data {
	keys: Key[]
	applications: Application[]
}
