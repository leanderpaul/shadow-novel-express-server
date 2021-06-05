import type { Novel, NovelChapter, Genres, Tags, NovelStatus, NovelVolume, User } from '@leanderpaul/shadow-novel-database';

import type { NovelURLParams, NovelVolumeURLParams, Pagination } from '../../typescript/index';

export interface LatestUpdatesAggregate extends Pick<Novel, 'nid' | 'title' | 'genre'> {
  author: Pick<User, 'uid' | 'username'>;
  chapter: Pick<NovelChapter, 'cid' | 'index' | 'title' | 'createdAt'>;
}

export type NovelInput = Omit<Novel, 'nid' | 'createdAt' | 'uid' | 'volumes' | 'views' | 'chapterCount' | 'lastUpdated'>;

export interface CreateNovel {
  body: NovelInput & {
    type: 'book' | 'series';
  };
  response: Novel;
}

export interface ListNovels {
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
  response: Omit<Novel, 'uid'> & { chapters: Pick<NovelChapter, 'cid' | 'index' | 'title' | 'createdAt'>[]; author: string };
}

export interface UpdateNovel {
  url: NovelURLParams;
  body: NovelInput;
  response: Novel;
}

export interface GetLatestUpdates {
  response: {
    items: LatestUpdatesAggregate[];
  };
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
