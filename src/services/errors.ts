/**
 * Importing npm packages.
 */
import { response } from 'express';
import { UserDBErrors, NovelDBErrors, ChapterDBErrors } from '@leanderpaul/shadow-novel-database';
import { Error as MongooseError } from 'mongoose';
import { MongoError } from 'mongodb';

/**
 * Importing user defined packages.
 */

/**
 * Importing and defining types.
 */
declare module 'express-serve-static-core' {
  interface Response {
    error(err: any): Response;
  }
}

export enum ServerErrors {
  /** Common Errors */
  UNEXPECTED_SERVER_ERROR = 'UNEXPECTED_SERVER_ERROR',
  UNEXPECTED_CLIENT_REQUEST = 'UNEXPECTED_CLIENT_REQUEST',

  /** Not found errors */
  API_NOT_FOUND = 'API_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  NOVEL_NOT_FOUND = 'NOVEL_NOT_FOUND',
  NOVEL_VOLUME_NOT_FOUND = 'NOVEL_VOLUME_NOT_FOUND',
  NOVEL_CHAPTER_NOT_FOUND = 'NOVEL_CHAPTER_NOT_FOUND',

  /** Auth Errors */
  CREDS_INVALID = 'CREDS_INVALID',
  AUTH_TOKEN_REQUIRED = 'AUTH_TOKEN_REQUIRED',
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',

  /** Novel Logical Errors */
  NOVEL_VOLUME_INVALID = 'NOVEL_VOLUME_INVALID',

  /** Scraper Errors */
  SCRAPER_URL_INVALID = 'SCRAPER_URL_INVALID',
  SCRAPER_START_URL_REQUIRED = 'SCRAPER_START_URL_REQUIRED',
  WEBNOVEL_BOOK_ID_REQUIRED = 'WEBNOVEL_BOOK_ID_REQUIRED',
  WEBNOVEL_COOKIE_REQUIRED = 'WEBNOVEL_COOKIE_REQUIRED',
  WEBNOVEL_METADATA_INVALID = 'WEBNOVEL_METADATA_INVALID',

  /** Prodile Errors */
  NOVEL_ALREADY_IN_LIBRARY = 'NOVEL_ALREADY_IN_LIBRARY'
}

type TErrors = ServerErrors | NovelDBErrors | UserDBErrors | ChapterDBErrors;

/**
 * Declaring the constants.
 */
const logger = global.getLogger('server:error');

const errorMessages: Partial<Record<TErrors, string>> = {
  /** Server: Common errors */
  UNEXPECTED_SERVER_ERROR: 'Unexpected server error has occured',
  UNEXPECTED_CLIENT_REQUEST: 'Unexpected client request error',

  /** Server:  Not found errors */
  API_NOT_FOUND: 'API not found',
  USER_NOT_FOUND: 'User not found',
  NOVEL_NOT_FOUND: 'Novel not found',
  NOVEL_VOLUME_NOT_FOUND: 'Novel volume not found',
  NOVEL_CHAPTER_NOT_FOUND: 'Novel chapter not found',

  /** Server: Auth errors */
  AUTH_TOKEN_EXPIRED: 'Session expired',
  CREDS_INVALID: 'Invalid credentials provided',
  AUTH_TOKEN_REQUIRED: 'Authorization token is required',
  AUTH_TOKEN_INVALID: 'Authorization token is invalid or expired',
  UNAUTHORIZED: 'Access denied',

  /** Server: Novel logical errors */
  NOVEL_VOLUME_INVALID: 'Novel is of type book and does not have volume',

  /** Server: Scraper Errors */
  SCRAPER_URL_INVALID: 'Invalid scraper URL provided',
  SCRAPER_START_URL_REQUIRED: 'Scraper starting URL required',
  WEBNOVEL_BOOK_ID_REQUIRED: 'Webnovel Book ID requried',
  WEBNOVEL_COOKIE_REQUIRED: 'Webnovel cookie requried',
  WEBNOVEL_METADATA_INVALID: 'Webnovel Book ID or Cookie is invalid',

  /** Server: Prodile Errors */
  NOVEL_ALREADY_IN_LIBRARY: 'Novel is already present in your library',

  /** DB: User errors */
  USERNAME_REQUIRED: 'Username is required',
  USERNAME_INVALID: 'Username is invalid',
  USERNAME_ALREADY_EXISTS: 'Username already exists',
  FIRST_NAME_INVALID: 'First name invalid',
  LAST_NAME_INVALID: 'Last name invalid',
  PASSWORD_REQUIRED: 'Password required',
  PASSWORD_INVALID: 'Password invalid',
  WEBNOVEL_COOKIE_INVALID: 'Webnovel cookie invalid',

  /** DB: Novel errors */
  NOVEL_TITLE_INVALID: 'Novel title invalid',
  NOVEL_TITLE_REQUIRED: 'Novel title required',
  GENRE_INVALID: 'Novel genre invalid',
  GENRE_REQUIRED: 'Novel genre required',
  TAGS_INVALID: 'Novel tags invalid',
  TAGS_REQUIRED: 'Novel tags required',
  STATUS_INVALID: 'Novel status invalid',
  STATUS_REQUIRED: 'Novel status required',
  DESC_REQUIRED: 'Novel description requried',
  DESC_TAG_INVALID: 'Invalid description content tag',
  DESC_TEXT_REQUIRED: 'Description content text required',
  NOVEL_ORIGIN_REQUIRED: 'Novel origin required',
  NOVEL_ORIGIN_INVALID: 'Novel origin invalid',
  WEBNOVEL_BOOK_ID_INVALID: 'Webnovel Book ID invalid',

  /** DB: Chapter errors */
  CHAPTER_CONTENT_REQUIRED: 'Chapter content required',
  CHAPTER_CONTENT_TAG_INVALID: 'Invalid chapter content tag',
  CHAPTER_CONTENT_TEXT_REQUIRED: 'Chapter content text required',
  CHAPTER_TITLE_REQUIRED: 'Chapter title required',
  CHAPTER_TITLE_INVALID: 'Chapter title invalid'
};

response.error = function (err) {
  const rid = this.req?.iam.getRID();

  /** Setting the status code */
  if (!this.statusCode || this.statusCode < 400) {
    if (typeof err === 'string' && err.includes('_NOT_FOUND')) this.status(404);
    else if (typeof err === 'string') this.status(400);
    else this.status(500);
  }

  /** Dealing with Mongoose errors */
  if (err instanceof MongooseError) {
    if (err instanceof MongooseError.ValidationError) {
      const errKeys = Object.keys(err.errors);
      err = err.errors[errKeys[0]].message;
    }
  }

  /** Dealing with MongoDB errors */
  if (err instanceof MongoError) {
    if (err.code === 11000) err = err.errmsg?.split('<>')[1];
  }

  /** Handling defined errors */
  if (typeof err === 'string') {
    const errCode = err;
    const errMsg = (errorMessages as Record<string, string>)[errCode];
    logger.warn(`Err: code - ${errCode}, msg - ${errMsg}`, { rid });
    if (errMsg) return this.json({ code: errCode, msg: errMsg });
    else return this.json({ code: ServerErrors.UNEXPECTED_CLIENT_REQUEST, msg: errorMessages.UNEXPECTED_CLIENT_REQUEST });
  }

  /** Handing undefined errors */
  logger.error(err, { rid });
  return this.json({ code: ServerErrors.UNEXPECTED_SERVER_ERROR, msg: errorMessages.UNEXPECTED_SERVER_ERROR });
};
