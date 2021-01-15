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
import { createNovel, createVolume, deleteVolume, getNovel, listNovels, updateNovel, updateVolume } from './novel.controller';

/**
 * Declaring the constants.
 */
const router = Router();

router.get('/novels', listNovels);

router.post('/novels', authorise(), createNovel);

router.get('/novels/:nid', getNovel);

router.put('/novels/:nid', authorise(true), updateNovel);

router.post('/novel/:nid/volumes', authorise(true), createVolume);

router.put('/novel/:nid/volumes/:vid', authorise(true), updateVolume);

router.delete('/novel/:nid/volumes/:vid', authorise(true), deleteVolume);

export default router;
