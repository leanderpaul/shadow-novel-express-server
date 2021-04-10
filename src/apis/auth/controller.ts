/**
 * Importing npm packages.
 */
import jwt from 'jsonwebtoken';
import { userModel, DBUtils } from '@leanderpaul/shadow-novel-database';
import { removeKeys } from '@leanderpaul/ts-utils';

/**
 * Importing user defined packages.
 */
import { JWT_SECRET_KEY } from '../../data/constants';
import { ServerErrors } from '../../services/index';

/**
 * Importing and defining types.
 */
import type { Request, Response } from 'express-serve-static-core';
import type { Login, Register } from './types';

/**
 * Declaring the constants.
 */

export async function registerUser(req: Request<any, any, Register['body']>, res: Response<Register['response']>) {
  try {
    const body = req.body;
    const user = await userModel.create(body);
    const token = jwt.sign({ username: user.username }, JWT_SECRET_KEY, { expiresIn: '2 days' });
    return res.status(201).json({ token, user: removeKeys(user.toObject(), ['_id', 'password']) });
  } catch (err) {
    return res.error(err);
  }
}

export async function loginUser(req: Request<any, any, Login['body']>, res: Response<Login['response']>) {
  try {
    const body = req.body;
    const user = await userModel.findOne({ username: body.username }).lean();
    if (!user) throw ServerErrors.USER_NOT_FOUND;
    if (!DBUtils.comparePassword(body.password, user.password)) throw ServerErrors.INVALID_CREDS;
    const token = jwt.sign({ username: user.username }, JWT_SECRET_KEY, { expiresIn: '2 days' });
    return res.json({ token, user: removeKeys(user, ['password']) });
  } catch (err) {
    return res.error(err);
  }
}
