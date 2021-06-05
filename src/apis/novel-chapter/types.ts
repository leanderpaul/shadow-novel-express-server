import type { NovelChapter } from '@leanderpaul/shadow-novel-database';

import type { ErrorResponse, NovelURLParams, Pagination, NovelChapterURLParams } from '../../typescript/index';

export type ChapterDetails = Omit<NovelChapter, 'nid'>;

export type NovelChapterInput = Pick<NovelChapter, 'vid' | 'title' | 'content' | 'matureContent'>;

export interface CreateChapter {
  url: NovelURLParams;
  body: NovelChapterInput;
  response: NovelChapter;
}

export interface ListChapters {
  url: NovelURLParams;
  response: {
    chapters: Pick<NovelChapter, 'cid' | 'index' | 'title' | 'createdAt'>[];
  };
}

export interface DownloadChapters {
  url: NovelURLParams;
  query: {
    sortOrder?: string;
    offset?: string;
    limit?: string;
  };
  response: {
    pagination: Pagination;
    items: ChapterDetails[];
  };
}

export interface GetChapter {
  url: NovelChapterURLParams;
  response: ChapterDetails;
}

export interface UpdateChapter {
  url: NovelChapterURLParams;
  body: Omit<NovelChapterInput, 'vid'>;
  response: ChapterDetails;
}

export interface DeleteChapter {
  url: NovelChapterURLParams;
}
