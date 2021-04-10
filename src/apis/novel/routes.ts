/**
 * Importing npm packages.
 */
import { Router } from 'express';

/**
 * Importing user defined packages.
 */
import { authorize } from '../../services/iam';

/**
 * Importing and defining types.
 */
import { createNovel, createVolume, deleteVolume, getNovel, listNovels, updateNovel, updateVolume } from './controller';

/**
 * Declaring the constants.
 */
const router = Router();

router.get('/novels', listNovels);

router.post('/novels', authorize(), createNovel);

router.get('/novels/:nid', getNovel);

router.put('/novels/:nid', authorize(true), updateNovel);

router.post('/novels/:nid/volumes', authorize(true), createVolume);

router.put('/novels/:nid/volumes/:vid', authorize(true), updateVolume);

router.delete('/novels/:nid/volumes/:vid', authorize(true), deleteVolume);

export default router;
