/**
 * Importing npm packages.
 */

/**
 * Importing user defined packages.
 */
import { validGenres, validTags } from './constants';

/**
 * Importing and defining types.
 */
interface Filter {
  sortField?: string;
  sortOrder?: string;
  offset?: string;
  limit?: string;
}

interface NovelFilter {
  offset: number;
  limit: number;
  sort: {
    field: string;
    order: 'asc' | 'desc';
  };
}

interface ChapterFilter {
  offset: number;
  limit?: number;
  sortOrder: 'asc' | 'desc';
}

/**
 * Declaring the constants.
 */
const validNovelSortFields = ['title', 'createdAt', 'views', 'chapterCount'];

export function isNovelGenre(genre?: string) {
  if (!genre) return false;
  if (validGenres.includes(genre)) return true;
  return false;
}

export function isNovelTags(tags: string[]) {
  for (let index = 0; index < tags.length; index++) {
    const tag = tags[index];
    if (!validTags.includes(tag)) return false;
  }
  return true;
}

export function isNovelStatus(status?: string) {
  if (status !== 'ongoing' && status !== 'completed') return false;
  return true;
}

export function getNovelFilter(filter: Filter): NovelFilter {
  const offset = parseInt(filter.offset || '0');
  const limit = parseInt(filter.limit || '20');
  return {
    offset: isNaN(offset) || offset < 0 ? 0 : offset,
    limit: isNaN(limit) || limit < 1 ? 20 : limit,
    sort: {
      field: validNovelSortFields.includes(filter.sortField || '') ? filter.sortField! : 'title',
      order: filter.sortOrder === 'asc' || filter.sortOrder === 'desc' ? filter.sortOrder : 'asc'
    }
  };
}

export function getChapterFilter(filter: Omit<Filter, 'sortField'>): ChapterFilter {
  const offset = parseInt(filter.offset || '0');
  const chapterFilter: ChapterFilter = {
    offset: isNaN(offset) || offset < 0 ? 0 : offset,
    sortOrder: filter.sortOrder === 'asc' || filter.sortOrder === 'desc' ? filter.sortOrder : 'asc'
  };
  if (filter.limit) chapterFilter.limit = parseInt(filter.limit || '20');
  return chapterFilter;
}

export function trimObject<T extends object>(obj: T): T {
  const keys = (Object.keys(obj) as unknown) as (keyof T)[];
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    if (!obj[key]) delete obj[key];
  }
  return obj;
}

export function pickKeys<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const newObj: any = {};
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    newObj[key] = obj[key];
  }
  return newObj;
}
