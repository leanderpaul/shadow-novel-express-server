/**
 * Importing npm packages.
 */

/**
 * Importing user defined packages.
 */

/**
 * Importing and defining types.
 */
export type AuthMode = 'optional' | 'authenticated';

export interface RouteConfig {
  /** Mode of authentication to be used */
  authMode?: AuthMode;
  validateNovel?: boolean;
}

/**
 * Declaring the constants.
 */
export const ROUTE_CONFIGS: Partial<Record<string, RouteConfig>> = {
  /** Auth route keys */
  login: {},
  register: {},
  getLatestUpdates: {},
  listNovels: {},
  createNovel: {
    authMode: 'authenticated'
  },
  getNovel: {
    authMode: 'optional'
  },
  updateNovel: {
    authMode: 'authenticated',
    validateNovel: true
  },
  createVolume: {
    authMode: 'authenticated',
    validateNovel: true
  },
  updateVolume: {
    authMode: 'authenticated',
    validateNovel: true
  },
  deleteVolume: {
    authMode: 'authenticated',
    validateNovel: true
  },
  createChapter: {
    authMode: 'authenticated',
    validateNovel: true
  },
  listChapter: {},
  getChapter: {},
  updateChapter: {
    authMode: 'authenticated',
    validateNovel: true
  },
  deleteChapter: {
    authMode: 'authenticated',
    validateNovel: true
  },
  scrapeNovel: {
    authMode: 'authenticated',
    validateNovel: true
  },
  getScraperTaskStatus: {
    authMode: 'authenticated',
    validateNovel: true
  },
  updateScraperTask: {
    authMode: 'authenticated',
    validateNovel: true
  },
  getProfile: {
    authMode: 'authenticated'
  },
  updateProfile: {
    authMode: 'authenticated'
  },
  updatePassword: {
    authMode: 'authenticated'
  },
  addNovelToLibrary: {
    authMode: 'authenticated'
  }
};
