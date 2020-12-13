/**
 * Importing npm packages.
 */
import dotenv from 'dotenv';

/**
 * Importing user defined packages.
 */

/**
 * Importing and defining types.
 */
import { app } from './server';
import { logger } from './utils/logger';

/**
 * Setting up and checking the server env.
 */
dotenv.config();

if (!process.env.PORT) throw new Error('Env: Server port required !');
if (!process.env.DB) throw new Error('Env: Database URI required !');
if (!process.env.JWT_SECRET) throw new Error('Env: JWT Secret key required !');

/**
 * Declaring the constants.
 */
const port = process.env.PORT;

/**
 * Setting up the server listener.
 */
app.listen(port, () => logger.info(`Server listening in port ${port}`));
