/**
 * Importing npm packages.
 */
import jwt from 'jsonwebtoken';
import { novelModel, userModel, User, Novel } from '@leanderpaul/shadow-novel-database';

/**
 * Importing user defined packages.
 */
import { secretKey } from './constants';

/**
 * Importing and defining types.
 */
import type { Request, Response, NextFunction } from 'express-serve-static-core';

interface Payload {
  username: string;
}

interface URLParams {
  nid: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user: Pick<User, 'uid' | 'username'>;
    novel: Pick<Novel, 'nid'>;
  }
}

/**
 * Declaring the constants.
 */

export function authorise(verifyNovel: boolean = false): (req: Request<URLParams>, res: Response, next: NextFunction) => void {
  return async (req, res, next) => {
    const authToken = req.headers.authorization;
    if (!authToken) return res.status(401).json({ code: 'UNAUTHENTICATED', msg: 'User not authenticated !' });
    const payload = jwt.verify(authToken, secretKey) as Payload;
    const user = await userModel.findByUsername(payload.username, ['uid', 'username']);
    if (!user) return res.status(403).json({ code: 'USER_NOT_FOUND', msg: 'Congrats ! You have hacked this server !' });
    req.user = user;
    if (!verifyNovel) return next();
    const novel = await novelModel.findById(req.params.nid, ['nid', 'author']);
    if (!novel) return res.status(404).json({ code: 'NOVEL_NOT_FOUND', msg: 'Novel not Found !' });
    if (novel.author !== user.username) return res.status(403).json({ code: 'ACCESS_DENIED', msg: 'You do not have the permission for this novel !' });
    req.novel = novel;
    return next();
  };
}
