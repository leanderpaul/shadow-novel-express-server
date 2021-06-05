/**
 * Importing npm packages.
 */
import { userModel, DBUtils } from '@leanderpaul/shadow-novel-database';
import { removeKeys } from '@leanderpaul/ts-utils';

/**
 * Importing user defined packages.
 */
import { ServerErrors } from '../../services';

/**
 * Importing and defining types.
 */
import type { Request, Response } from 'express-serve-static-core';
import type { AddNovelToLibrary, GetProfile, UpdatePassword, UpdateProfile } from './types';

/**
 * Declaring the constants.
 */

export async function getProfile(req: Request, res: Response<GetProfile['response']>) {
  try {
    const user = req.iam.getUser()!;
    const userObj = removeKeys(user, ['password', 'library']);
    return res.json(userObj);
  } catch (err) {
    return res.error(err);
  }
}

export async function updateProfile(req: Request<any, any, UpdateProfile['body']>, res: Response<UpdateProfile['response']>) {
  try {
    const body = req.body;
    const user = req.iam.getUser()!;
    await userModel.updateOne({ uid: user.uid }, { $set: body });
    const userObj = removeKeys(user, ['password']);
    return res.json({ ...userObj, ...body });
  } catch (err) {
    return res.error(err);
  }
}

export async function updatePassword(req: Request<any, any, UpdatePassword['body']>, res: Response) {
  try {
    const body = req.body;
    const user = req.iam.getUser()!;
    const isValidPassword = DBUtils.comparePassword(body.oldPassword, user.password);
    if (isValidPassword === false) throw ServerErrors.CREDS_INVALID;
    const password = DBUtils.hashPassword(body.newPassword);
    await userModel.updateOne({ uid: user.uid }, { $set: { password } });
    return res.json({});
  } catch (err) {
    return res.error(err);
  }
}

export async function addNovelToLibrary(req: Request<any, any, AddNovelToLibrary['body']>, res: Response<AddNovelToLibrary['response']>) {
  try {
    const { nid } = req.body;
    const user = req.iam.getUser()!;
    const isNovelInLibrary = user.library.includes(nid);
    if (isNovelInLibrary) throw ServerErrors.NOVEL_ALREADY_IN_LIBRARY;
    await userModel.updateOne({ uid: user.uid }, { $push: { library: nid } });
    return res.json([...user.library, nid]);
  } catch (err) {
    return res.error(err);
  }
}
