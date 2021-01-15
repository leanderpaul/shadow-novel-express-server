import type { NovelChapter } from '@leanderpaul/shadow-novel-database';

import type { ErrorResponse, NovelURLParams, Pagination, NovelChapterURLParams } from '../../typescript/index';

export type ChapterDetails = Pick<NovelChapter, 'cid' | 'index' | 'title' | 'content' | 'matureContent' | 'createdAt'>;

export interface NovelChapterInput {
  vid: string;
  title: string;
  content: string;
  matureContent: string;
}

export interface CreateChapter {
  url: NovelURLParams;
  body: NovelChapterInput;
  response: NovelChapter | ErrorResponse;
}

export interface GetChapters {
  url: NovelURLParams;
  query: {
    sortOrder?: string;
    offset?: string;
    limit?: string;
  };
  response: {
    pagination: Pagination;
    chapters: ChapterDetails[];
  };
}

export interface GetChapter {
  url: NovelChapterURLParams;
  response: ChapterDetails | ErrorResponse;
}

export interface UpdateChapter {
  url: NovelChapterURLParams;
  body: Omit<NovelChapterInput, 'vid'>;
  response: ChapterDetails | ErrorResponse;
}

export interface DeleteChapter {
  url: NovelChapterURLParams;
}
