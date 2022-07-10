// scripts/test
// Runs `tsc` to check types.

import { stdout } from 'node:process'
import 'zx/globals'

import { config as loadConfig } from 'dotenv'

import { logger } from './utilities/logger.js'

logger.title('scripts/test')

// Read the development configuration file.
loadConfig({ path: 'config/test.env' })

// Then run `tsc`.
logger.info('checking types')
stdout.write('\n')

await $`tsc`

stdout.write('\n')
logger.success('found no type errors')

logger.end()
