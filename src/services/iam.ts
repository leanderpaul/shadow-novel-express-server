/**
 * Importing npm packages.
 */
import jwt from 'jsonwebtoken';
import { DBUtils, userModel, novelModel } from '@leanderpaul/shadow-novel-database';

/**
 * Importing user defined packages.
 */
import { ServerErrors } from './errors';
import { JWT_SECRET_KEY } from '../data/constants';

/**
 * Importing and defining types.
 */
import type { RequestHandler } from 'express-serve-static-core';
import type { User, Novel } from '@leanderpaul/shadow-novel-database';

declare module 'express-serve-static-core' {
  interface Request {
    iam: IAM;
  }
}

/**
 * Constants.
 */
const logger = getLogger('server:iam');

export class IAM {
  private rid;
  private user?: User;
  private novel?: Novel;

  private constructor() {
    this.rid = DBUtils.generateUUID();
  }

  static init(): RequestHandler {
    return function (req, _res, next) {
      req.iam = new IAM();
      next();
    };
  }

  getRID() {
    return this.rid;
  }

  setuser(user: User) {
    this.user = user;
    return this;
  }

  getUser() {
    return this.user;
  }

  setNovel(novel: Novel) {
    this.novel = novel;
    return this;
  }

  getNovel() {
    return this.novel;
  }
}

export function authorize(verifyNovel: boolean = false): RequestHandler {
  return async function (req, res, next) {
    try {
      const token = req.headers.authorization;
      if (!token) throw ServerErrors.AUTH_TOKEN_REQUIRED;
      const payload = jwt.verify(token, JWT_SECRET_KEY) as { username: string };
      const user = await userModel.findOne({ username: payload.username }).lean();
      if (!user) {
        logger.error(`Security breached, user not found in token`);
        throw ServerErrors.AUTH_TOKEN_INVALID;
      }
      if (verifyNovel) {
        const novel = await novelModel.findOne({ nid: req.params.nid }).lean();
        if (!novel) throw ServerErrors.NOVEL_NOT_FOUND;
        if (novel.uid !== user.uid) throw ServerErrors.UNAUTHORIZED;
        req.iam.setNovel(novel);
      }
      req.iam.setuser(user);
      return next();
    } catch (err) {
      return res.error(err);
    }
  };
}
