/**
 * Importing npm packages.
 */
import express from 'express';
import db from '@leanderpaul/shadow-novel-database';

/**
 * Importing user defined packages.
 */
import authRoutes from './apis/auth/auth.routes';

/**
 * Importing and defining types.
 */
import type { Request, Response, NextFunction } from 'express-serve-static-core';

/**
 * Declaring the constants.
 */
const app = express();

/**
 * Setting up the database.
 */
db.connect();

/**
 * Middlewares
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * API Routes.
 */
app.use('/', authRoutes);
app.get('/status', (_req, res) => res.status(200).json({ msg: 'Server working !' }));
app.use('*', (_req, res) => res.status(404).json({ code: 'API_NOT_FOUND', msg: 'API not Found !' }));
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', msg: 'Internal Server Error !', err }));

/**
 * Exporting the app server.
 */
export { app };
