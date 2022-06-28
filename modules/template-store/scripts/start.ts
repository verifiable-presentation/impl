// scripts/start
// Runs the server in production mode.

import 'zx/globals'
import { config as loadConfig } from 'dotenv'

import { logger } from './utilities/logger.js'

logger.title('scripts/start')

// Read the production configuration file.
loadConfig({ path: 'config/prod.env' })

// Then run the server.
await $`node build/server.js`

logger.success('shutting down server')
logger.end()
