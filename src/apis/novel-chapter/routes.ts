/**
 * Importing npm packages.
 */
import { Router } from 'express';

/**
 * Importing user defined packages.
 */
import { authorize } from '../../services/index';

/**
 * Importing and defining types.
 */
import { createChapter, deleteChapter, getChapter, updateChapter, listChapters } from './controller';

/**
 * Declaring the constants.
 */
const router = Router();

router.post('/novels/:nid/chapters', authorize(true), createChapter);

router.get('/novels/:nid/chapters', listChapters);

router.get('/novels/:nid/chapters/:cid', getChapter);

router.put('/novels/:nid/chapters/:cid', authorize(true), updateChapter);

router.delete('/novels/:nid/chapters/:cid', authorize(true), deleteChapter);

export default router;
