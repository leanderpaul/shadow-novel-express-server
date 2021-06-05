/**
 * Importing npm packages.
 */
import { Router } from 'express';

/**
 * Importing user defined packages.
 */
import { IAM } from '../../services/index';
import { addNovelToLibrary, getProfile, updatePassword, updateProfile } from './controller';

/**
 * Importing and defining types.
 */

/**
 * Declaring the constants.
 */
const router = Router();

router.get('/', IAM.secure(getProfile));

router.put('/', IAM.secure(updateProfile));

router.post('/update-password', IAM.secure(updatePassword));

router.post('/library', IAM.secure(addNovelToLibrary));

export default router;
