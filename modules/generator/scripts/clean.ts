// scripts/clean
// Deletes generated files.

import 'zx/globals'

import { logger } from './utilities/logger.js'

logger.title('scripts/clean')

await $`rm -rf *.log *.tgz *.bak *.tmp .cache/`
await $`rm -rf coverage/ build/`
await $`mkdir -p build/`

if (!fs.existsSync('config/dev.env'))
	await $`cp config/dev.env.sample config/dev.env`
if (!fs.existsSync('config/test.env'))
	await $`cp config/test.env.sample config/test.env`
if (!fs.existsSync('config/prod.env'))
	await $`cp config/prod.env.sample config/prod.env`

logger.end()
