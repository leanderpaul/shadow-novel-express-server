/**
 * Importing npm packages.
 */
import { response } from 'express';
import { UserDBErrors, NovelDBErrors, ChapterDBErrors } from '@leanderpaul/shadow-novel-database';
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
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
  API_NOT_FOUND = 'API_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  NOVEL_NOT_FOUND = 'NOVEL_NOT_FOUND',
  INVALID_CREDS = 'INVALID_CREDS',
  AUTH_TOKEN_REQUIRED = 'AUTH_TOKEN_REQUIRED',
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOVEL_VOLUME_INVALID = 'NOVEL_VOLUME_INVALID',
  NOVEL_VOLUME_NOT_FOUND = 'NOVEL_VOLUME_NOT_FOUND',
  NOVEL_CHAPTER_NOT_FOUND = 'NOVEL_CHAPTER_NOT_FOUND'
}

type TErrors = ServerErrors | NovelDBErrors | UserDBErrors | ChapterDBErrors;

/**
 * Declaring the constants.
 */
const logger = global.getLogger('server:error');

const errorMessages: Partial<Record<TErrors, string>> = {
  UNEXPECTED_ERROR: 'Unexpected error has occured',
  API_NOT_FOUND: 'API not found',
  USERNAME_REQUIRED: 'Username is required',
  USERNAME_INVALID: 'Username is invalid',
  USERNAME_ALREADY_EXISTS: 'Username already exists',
  CHAPTER_CONTENT_REQUIRED: 'Chapter content required',
  CHAPTER_CONTENT_TAG_INVALID: 'Invalid chapter content tag',
  CHAPTER_CONTENT_TEXT_REQUIRED: 'Chapter content text required',
  CHAPTER_TITLE_REQUIRED: 'Chapter title required',
  CHAPTER_TITLE_INVALID: 'Chapter title invalid',
  DESC_REQUIRED: 'Novel description requried',
  DESC_TAG_INVALID: 'Invalid description content tag',
  DESC_TEXT_REQUIRED: 'Description content text required',
  FIRST_NAME_INVALID: 'First name invalid',
  GENRE_INVALID: 'Novel genre invalid',
  GENRE_REQUIRED: 'Novel genre required',
  LAST_NAME_INVALID: 'Last name invalid',
  NOVEL_TITLE_INVALID: 'Novel title invalid',
  NOVEL_TITLE_REQUIRED: 'Novel title required',
  PASSWORD_INVALID: 'Password invalid',
  PASSWORD_REQUIRED: 'Password required',
  STATUS_INVALID: 'Novel status invalid',
  STATUS_REQUIRED: 'Novel status required',
  TAGS_INVALID: 'Novel tags invalid',
  TAGS_REQUIRED: 'Novel tags required',
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDS: 'Invalid credentials provided',
  AUTH_TOKEN_REQUIRED: 'Authorization token is required',
  AUTH_TOKEN_INVALID: 'Authorization token is invalid or expired',
  UNAUTHORIZED: 'Access denied',
  NOVEL_NOT_FOUND: 'Novel not found',
  NOVEL_VOLUME_INVALID: 'Novel is of type book and does not have volume',
  NOVEL_VOLUME_NOT_FOUND: 'Novel volume not found'
};

response.error = function (err) {
  if (!this.statusCode || this.statusCode < 400) {
    if (typeof err === 'string' && err.includes('_NOT_FOUND')) this.status(404);
    else this.status(400);
  }
  if (err instanceof MongoError) {
    if (err.code === 11000) err = err.errmsg?.split('<>')[1];
  }
  if (typeof err === 'string') {
    const errCode = err;
    const errMsg = (errorMessages as Record<string, string>)[errCode];
    if (errMsg) return this.json({ code: errCode, msg: errMsg });
  }
  logger.error(err);
  return this.json({ code: ServerErrors.UNEXPECTED_ERROR, msg: errorMessages['UNEXPECTED_ERROR'] });
};
