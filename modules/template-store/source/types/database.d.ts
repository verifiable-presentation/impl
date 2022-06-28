// source/types/database.d.ts
// The type definitions for the JSON database.

import type { Template } from './api.js'

/**
 * The data stored in the database.
 */
export declare interface Data {
	templates: Template[]
}
