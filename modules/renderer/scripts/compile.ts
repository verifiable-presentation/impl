// scripts/compile
// Runs `tsc` to check types and `jest` for compiles.

import 'zx/globals'
import { spinner } from 'zx/experimental'

import { logger } from './utilities/logger.js'

logger.title('scripts/compile')

// Run `tsup` to compile the server.
await spinner(logger.status('compiling server'), () => $`tsup source/server.ts`)
logger.success('successfully compiled server')

logger.end()
