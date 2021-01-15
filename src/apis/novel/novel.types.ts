import type { Novel, NovelChapter } from '@leanderpaul/shadow-novel-database';

import type { ErrorResponse, NovelURLParams, NovelVolumeURLParams, Pagination } from '../../typescript/index';

export interface NovelInput {
  cover?: string;
  title: string;
  genre: string;
  desc: string;
  status: string;
  tags: string[];
}

export interface CreateNovel {
  body: NovelInput;
  response: Novel | ErrorResponse;
}

export interface FindNovel {
  query: {
    title?: string;
    author?: string;
    genre?: string;
    status?: string;
    tags?: string[];
    sortField?: string;
    sortOrder?: string;
    offset?: string;
    limit?: string;
  };
  response: {
    pagination: Pagination;
    novels: Pick<Novel, 'nid' | 'cover' | 'title' | 'genre' | 'desc' | 'status'>[];
  };
}

export interface GetNovel {
  url: NovelURLParams;
  response: (Novel & { chapters: Pick<NovelChapter, 'cid' | 'index' | 'title' | 'createdAt'>[] }) | ErrorResponse;
}

export interface UpdateNovel {
  url: NovelURLParams;
  body: NovelInput;
  response: Novel | ErrorResponse;
}

export interface CreateVolume {
  url: NovelURLParams;
  body: {
    name?: string;
  };
  response: Novel | ErrorResponse;
}

export interface UpdateVolume {
  url: NovelVolumeURLParams;
  body: {
    name: string;
  };
  response: Novel | ErrorResponse;
}

export interface DeleteVolume {
  url: NovelVolumeURLParams;
  response: Novel | ErrorResponse;
}
