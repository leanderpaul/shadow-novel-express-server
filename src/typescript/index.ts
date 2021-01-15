export interface ErrorResponse {
  code: string;
  msg: string;
  err?: any;
}

export interface Pagination {
  offset: number;
  limit: number;
  totalCount: number;
}

export interface NovelURLParams {
  nid: string;
}

export interface NovelVolumeURLParams extends NovelURLParams {
  vid: string;
}

export interface NovelChapterURLParams extends NovelURLParams {
  cid: string;
}
