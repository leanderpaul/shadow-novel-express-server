import type { Novel, NovelChapter, Genres, Tags, NovelStatus, NovelVolume } from '@leanderpaul/shadow-novel-database';

import type { NovelURLParams, NovelVolumeURLParams, Pagination } from '../../typescript/index';

export type NovelInput = Omit<Novel, 'nid' | 'createdAt' | 'uid' | 'volumes' | 'views' | 'chapterCount'>;

export interface CreateNovel {
  body: NovelInput & {
    type: 'book' | 'series';
  };
  response: Novel;
}

export interface FindNovel {
  query: {
    title?: string;
    uid?: string;
    genre?: Genres;
    status?: NovelStatus;
    tags?: Tags[];
    sortField?: string;
    sortOrder?: string;
    offset?: string;
    limit?: string;
  };
  response: {
    pagination: Pagination;
    items: Pick<Novel, 'nid' | 'cover' | 'title' | 'genre' | 'desc' | 'status'>[];
  };
}

export interface GetNovel {
  url: NovelURLParams;
  response: Novel & { chapters: Pick<NovelChapter, 'cid' | 'index' | 'title' | 'createdAt'>[] };
}

export interface UpdateNovel {
  url: NovelURLParams;
  body: NovelInput;
  response: Novel;
}

export interface CreateVolume {
  url: NovelURLParams;
  body: {
    name?: string;
  };
  response: NovelVolume;
}

export interface UpdateVolume {
  url: NovelVolumeURLParams;
  body: {
    name: string;
  };
  response: NovelVolume;
}

export interface DeleteVolume {
  url: NovelVolumeURLParams;
}
