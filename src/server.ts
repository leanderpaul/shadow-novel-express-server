/**
 * Importing npm packages.
 */
import express from 'express';
import morgan from 'morgan';

/**
 * Importing user defined packages.
 */
import routes from './apis/index';
import { IAM, ServerErrors } from './services/index';

/**
 * Importing and defining types.
 */
import type { Request, Response, NextFunction } from 'express-serve-static-core';

/**
 * Declaring the constants.
 */
const app = express();
const logger = getLogger('server:morgan');
const MORGAN_FORMAT = ':method :url :status :req[content-length]B in :res[content-length]B out - :response-time ms';

/**
 * Middlewares
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(IAM.init());
app.use(morgan(MORGAN_FORMAT, { stream: { write: (msg) => logger.http(msg.replace('\n', '')) } }) as any);

/**
 * API Routes.
 */
app.use('/', routes);
app.get('/status', (_req, res) => res.json({ msg: 'Server working !' }));
app.use('*', (_req, res) => res.error(ServerErrors.API_NOT_FOUND));
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => res.error(err));

/**
 * Exporting the app server.
 */
export { app };
