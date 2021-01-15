/**
 * Importing npm packages.
 */
import { Router } from 'express';

/**
 * Importing user defined packages.
 */
import { authorise } from '../../utils/middlewares';

/**
 * Importing and defining types.
 */
import { createChapter, deleteChapter, getChapter, getChapters, updateChapter } from './novel-chapter.controller';

/**
 * Declaring the constants.
 */
const router = Router();

router.post('/novels/:nid/chapters', authorise(true), createChapter);

router.get('/novels/:nid/chapters', getChapters);

router.get('/novels/:nid/chapters/:cid', getChapter);

router.put('/novels/:nid/chapters/:cid', authorise(true), updateChapter);

router.delete('/novels/:nid/chapters/:cid', authorise(true), deleteChapter);

export default router;
