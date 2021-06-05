/**
 * Importing npm packages.
 */
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { DBUtils, userModel, novelModel } from '@leanderpaul/shadow-novel-database';

/**
 * Importing user defined packages.
 */
import { ServerErrors } from './errors';
import { JWT_SECRET_KEY } from '../data/constants';
import { ROUTE_CONFIGS } from '../data/security';

/**
 * Importing and defining types.
 */
import type { RequestHandler, Request, Response } from 'express-serve-static-core';
import type { User, Novel } from '@leanderpaul/shadow-novel-database';
import type { AuthMode } from '../data/security';

declare module 'express-serve-static-core' {
  interface Request {
    iam: IAM;
  }
}

type Controller = (req: Request<any>, res: Response) => Promise<Response> | Response;
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

  private static verifyNovelAuthor(): RequestHandler {
    return async function (req, res, next) {
      try {
        const user = req.iam.getUser()!;
        const novel = await novelModel.findOne({ nid: req.params.nid }).lean();
        if (!novel) throw ServerErrors.NOVEL_NOT_FOUND;
        if (novel.uid !== user.uid) throw ServerErrors.UNAUTHORIZED;
        req.iam.setNovel(novel);
        return next();
      } catch (err) {
        return res.status(403).error(err);
      }
    };
  }

  private static authorizeUser(authMode: AuthMode): RequestHandler {
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
        req.iam.setuser(user);
        return next();
      } catch (err) {
        if (authMode === 'optional') return next();
        if (err instanceof TokenExpiredError) err = ServerErrors.AUTH_TOKEN_EXPIRED;
        else if (err instanceof JsonWebTokenError) err = ServerErrors.AUTH_TOKEN_INVALID;
        return res.status(401).error(err);
      }
    };
  }

  static secure(controller: Controller): RequestHandler[] {
    const routeKey = controller.name;
    const routeConfig = ROUTE_CONFIGS[routeKey];
    const routeHandlers = [];
    if (routeConfig?.authMode) routeHandlers.push(IAM.authorizeUser(routeConfig.authMode));
    if (routeConfig?.validateNovel) routeHandlers.push(IAM.verifyNovelAuthor());
    routeHandlers.push(controller);
    return routeHandlers;
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
