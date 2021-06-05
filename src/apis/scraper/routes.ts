/**
 * Importing npm packages.
 */
import { Router } from 'express';

/**
 * Importing user defined packages.
 */
import { IAM } from '../../services/index';

/**
 * Importing and defining types.
 */
import { getScraperTaskStatus, scrapeNovel, updateScraperTask } from './controller';

/**
 * Declaring the constants.
 */
const router = Router();

router.post('/:nid', IAM.secure(scrapeNovel));

router.get('/:nid', IAM.secure(getScraperTaskStatus));

router.put('/:nid', IAM.secure(updateScraperTask));

export default router;
