/**
 * Importing npm packages.
 */
import { Router } from 'express';

/**
 * Importing user defined packages.
 */

/**
 * Importing and defining types.
 */
import authRoutes from './auth/routes';
import novelRoutes from './novel/routes';
import novelChapterRoutes from './novel-chapter/routes';

/**
 * Declaring the constants.
 */
const router = Router();

router.use('/', authRoutes);

router.use('/', novelRoutes);

router.use('/', novelChapterRoutes);

export default router;
