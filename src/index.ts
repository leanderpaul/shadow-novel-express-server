/**
 * Importing npm packages.
 */
import dotenv from 'dotenv';
import '@leanderpaul/shadow-novel-database';

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
const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV || 'development';
const logger = global.getLogger('server:index');

/**
 * Importing the required packages.
 */
import { app } from './server';

/**
 * Setting up the server listener.
 */
app.listen(PORT, () => logger.info(`${NODE_ENV} server started in port ${PORT}`));
