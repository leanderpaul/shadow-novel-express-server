import type { ParamsDictionary } from 'express-serve-static-core';

export interface ErrorResponse {
  code: string;
  msg: string;
  err?: any;
}

export interface Pagination {
  offset: number;
  limit: number;
  totalCount: number;
  sort: { [k: string]: number };
}

export interface NovelURLParams extends ParamsDictionary {
  nid: string;
}

export interface NovelVolumeURLParams extends NovelURLParams {
  vid: string;
}

export interface NovelChapterURLParams extends NovelURLParams {
  cid: string;
}
