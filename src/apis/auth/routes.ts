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
import { loginUser, registerUser, verifySession } from './controller';

/**
 * Declaring the constants.
 */
const router = Router();

router.post('/login', loginUser);

router.post('/register', registerUser);

router.post('/verify-session', verifySession);

export default router;
