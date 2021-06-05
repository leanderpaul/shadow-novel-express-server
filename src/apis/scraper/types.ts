import type { ScraperMetadata } from '../../services/scraper';

export interface NovelURLParams {
  nid: string;
}

export interface ScrapeNovel {
  url: NovelURLParams;
  body: {
    startURL: string;
  };
  response: ScraperMetadata;
}

export interface ScraperTaskStatus {
  url: NovelURLParams;
  response: ScraperMetadata | null;
}

export interface UpdateScraperTask {
  url: NovelURLParams;
  body: {
    op: 'stop';
  };
  response: ScraperMetadata | null;
}
