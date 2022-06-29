// source/types/fastify.d.ts
// The type definitions for the decorations we add to Fastify's server instance.

import type { FastifyInstance } from 'fastify'

import { renderer } from '../provider/renderer.js'
import { schema } from '../provider/schema.js'

export declare type DecoratedFastifyInstance = FastifyInstance & {
	renderer: typeof renderer
	schema: typeof schema
}
