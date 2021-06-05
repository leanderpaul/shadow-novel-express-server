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
import scraperRoutes from './scraper/routes';
import profileRoutes from './profile/routes';

/**
 * Declaring the constants.
 */
const router = Router();

router.use('/auth', authRoutes);

router.use('/novels', novelRoutes);

router.use('/scrape', scraperRoutes);

router.use('/profile', profileRoutes);

export default router;
