/**
 * Importing npm packages.
 */
import jwt from 'jsonwebtoken';
import { userModel } from '@leanderpaul/shadow-novel-database';

/**
 * Importing user defined packages.
 */
import { secretKey } from '../../utils/constants';

/**
 * Importing and defining types.
 */
import type { Request, Response } from 'express-serve-static-core';
import type { Login, Register } from './auth.types';

/**
 * Declaring the constants.
 */

export async function registerUser(req: Request<any, any, Register['body']>, res: Response<Register['response']>) {
  const body = req.body;
  const user = await userModel.createUser(body);
  const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: '2 days' });
  return res.status(201).json({ token, user });
}

export async function loginUser(req: Request<any, any, Login['body']>, res: Response<Login['response']>) {
  const body = req.body;
  const user = await userModel.findByUsername(body.username);
  if (!user) return res.status(404).json({ code: 'USER_NOT_FOUND', msg: 'User does not exist !' });
  /**
   * @todo compare the passwords.
   */
  const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: '2 days' });
  return res.status(200).json({ token, user });
}
