// source/provider/schema.ts
// Defines and exports the schema validation service used by the server.

import Ajv from 'ajv'

// @ts-expect-error It's just typescript weirdness.
export const schema = new Ajv()
