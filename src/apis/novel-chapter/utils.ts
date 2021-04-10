/**
 * Importing npm packages.
 */

/**
 * Importing user defined packages.
 */

/**
 * Importing and defining types.
 */
interface Filter {
  sortOrder?: string;
  offset?: string;
  limit?: string;
}

/**
 * Declaring the constants.
 */
export function handlePagination(filter: Filter) {
  const offset = parseInt(filter.offset || '0');
  const limit = parseInt(filter.limit || '20');
  return {
    offset: isNaN(offset) || offset < 0 ? 0 : offset,
    limit: isNaN(limit) || limit <= 0 ? 20 : limit,
    sort: { index: filter.sortOrder === 'desc' ? -1 : 1 }
  };
}
