/**
 * Importing npm packages.
 */
import { Genres, Tags, NovelStatus } from '@leanderpaul/shadow-novel-database';

/**
 * Importing user defined packages.
 */

/**
 * Declaring the constants.
 */
interface Filter {
  sortField?: string;
  sortOrder?: string;
  offset?: string;
  limit?: string;
}

/**
 * Declaring the constants.
 */
const VALID_NOVEL_SORT_FIELDS = ['title', 'createdAt', 'views', 'chapterCount'];

function convertToNumber(value?: string | null) {
  if (!value) return;
  const num = parseInt(value);
  if (isNaN(num)) return;
  return num;
}

export function handlePagination(filter: Filter) {
  const sortField = VALID_NOVEL_SORT_FIELDS.includes(filter.sortField || '') ? filter.sortField! : 'title';
  const sortOrder = filter.sortOrder || 'asc';
  const limit = convertToNumber(filter.limit) || 20;
  const offset = convertToNumber(filter.offset) || 0;
  return {
    limit: limit > 0 ? limit : 20,
    offset: offset >= 0 ? offset : 0,
    sort: { [sortField]: sortOrder === 'asc' || sortOrder === '1' ? 1 : -1 }
  };
}

export function getNovelFilter(filter: Filter) {
  const offset = parseInt(filter.offset || '0');
  const limit = parseInt(filter.limit || '20');
  return {
    offset: isNaN(offset) || offset < 0 ? 0 : offset,
    limit: isNaN(limit) || limit < 1 ? 20 : limit,
    sort: {
      field: VALID_NOVEL_SORT_FIELDS.includes(filter.sortField || '') ? filter.sortField! : 'title',
      order: filter.sortOrder === 'asc' || filter.sortOrder === 'desc' ? filter.sortOrder : 'asc'
    }
  };
}
