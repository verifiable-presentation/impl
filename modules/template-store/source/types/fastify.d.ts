// source/types/fastify.d.ts
// The type definitions for the decorations we add to Fastify's server instance.

import type { FastifyInstance } from 'fastify'
import type { Low } from 'lowdb'

import type { Data } from './database.js'

export declare type DecoratedFastifyInstance = FastifyInstance & {
	database: Low<Data>
}
