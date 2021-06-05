/**
 * Importing npm packages.
 */
import jwt, { TokenExpiredError } from 'jsonwebtoken';
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
import type { Login, Register, VerifySession } from './types';

/**
 * Declaring the constants.
 */
const logger = getLogger('server:controller:auth');

export async function registerUser(req: Request<any, any, Register['body']>, res: Response<Register['response']>) {
  try {
    const body = req.body;
    const password = DBUtils.hashPassword(body.password);
    const user = await userModel.create({ uid: DBUtils.generateUUID(), ...body, password });
    logger.info(`new user ${user.uid} created`);
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
    if (!DBUtils.comparePassword(body.password, user.password)) throw ServerErrors.CREDS_INVALID;
    const token = jwt.sign({ username: user.username }, JWT_SECRET_KEY, { expiresIn: '2 days' });
    return res.json({ token, user: removeKeys(user, ['password']) });
  } catch (err) {
    return res.error(err);
  }
}

export async function verifySession(req: Request<any, any, VerifySession['body']>, res: Response<VerifySession['response']>) {
  try {
    const { token } = req.body;
    if (!token) throw ServerErrors.AUTH_TOKEN_REQUIRED;
    const payload = jwt.verify(token, JWT_SECRET_KEY) as { username: string };
    const user = await userModel.findOne({ username: payload.username }, '-password').lean();
    if (!user) {
      logger.warn(`Security breached, user not found in auth token.`);
      throw ServerErrors.AUTH_TOKEN_INVALID;
    }
    const jwtToken = jwt.sign({ username: user.username }, JWT_SECRET_KEY, { expiresIn: '2 days' });
    return res.json({ token: jwtToken, user: user });
  } catch (err) {
    if (err instanceof TokenExpiredError) err = ServerErrors.AUTH_TOKEN_EXPIRED;
    return res.error(err);
  }
}
