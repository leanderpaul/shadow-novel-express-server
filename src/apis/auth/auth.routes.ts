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
import { loginUser, registerUser } from './auth.controller';

/**
 * Declaring the constants.
 */
const router = Router();

router.post('/auth/login', loginUser);

router.post('/auth/register', registerUser);

export default router;
