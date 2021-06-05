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
import { createChapter, deleteChapter, getChapter, updateChapter, listChapters } from './controller';

/**
 * Declaring the constants.
 */
const router = Router({ mergeParams: true });

router.post('/', IAM.secure(createChapter));

router.get('/', IAM.secure(listChapters));

router.get('/:cid', IAM.secure(getChapter));

router.put('/:cid', IAM.secure(updateChapter));

router.delete('/:cid', IAM.secure(deleteChapter));

export default router;
