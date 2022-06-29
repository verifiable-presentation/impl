// scripts/test
// Runs `tsc` to check types and `jest` for tests.

import { stdout, exit } from 'node:process'
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

// Then run `ava`.
logger.info('running tests')
stdout.write('\n')

try {
	await $`c8 --check-coverage ava tests/integration/api.ts`.pipe(stdout)

	stdout.write('\n')
	logger.success('successfully ran all tests')
	logger.end()
} catch (error) {
	exit((error as any).exitCode)
}
