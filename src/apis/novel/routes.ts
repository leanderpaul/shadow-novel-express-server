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
import novelChapterRoutes from '../novel-chapter/routes';
import { createNovel, createVolume, deleteVolume, getLatestUpdates, getNovel, listNovels, updateNovel, updateVolume } from './controller';

/**
 * Declaring the constants.
 */
const router = Router();

router.get('/', IAM.secure(listNovels));

router.post('/', IAM.secure(createNovel));

router.get('/latest-updates', IAM.secure(getLatestUpdates));

router.get('/:nid', IAM.secure(getNovel));

router.put('/:nid', IAM.secure(updateNovel));

router.post('/:nid/volumes', IAM.secure(createVolume));

router.put('/:nid/volumes/:vid', IAM.secure(updateVolume));

router.delete('/:nid/volumes/:vid', IAM.secure(deleteVolume));

router.use('/:nid/chapters', novelChapterRoutes);

export default router;
