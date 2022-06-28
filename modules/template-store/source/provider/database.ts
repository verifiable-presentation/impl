// source/provider/database.ts
// Defines and exports the database service used by the server.

import { Low } from 'lowdb'

import { config } from '../utilities/config.js'

// Hit a new low! Sorry, couldn't resist.
const database = new Low(config.database.adapter)
// Load the contents of the database, if it is not empty.
await database.read()
// If it is empty, set it up.
database.data ??= {
	templates: [],
}

// Export the database.
export { database }
