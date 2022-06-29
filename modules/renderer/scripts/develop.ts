// scripts/develop
// Watches the `source/` folder for changes and reloads the server.

import 'zx/globals'

import { config as loadConfig } from 'dotenv'

import { logger } from './utilities/logger.js'

logger.title('scripts/develop')

// Read the development configuration file.
loadConfig({ path: 'config/dev.env' })

// Then run `tsx` in watch mode.
await $`tsx watch --clear-screen=false source/server.ts`

logger.success('shutting down server')
logger.end()
