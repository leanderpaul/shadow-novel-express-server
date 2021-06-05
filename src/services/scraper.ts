/**
 * Importing npm packages.
 */
import axios from 'axios';
import cheerio from 'cheerio';
import { DBUtils, chapterModel, novelModel } from '@leanderpaul/shadow-novel-database';

/**
 * Importing user defined packages.
 */
import { ServerErrors } from './errors';

/**
 * Importing and defining types.
 */
import type { AxiosResponse } from 'axios';
import type { EditorContent } from '@leanderpaul/shadow-novel-database/types';

export type ScraperTaskStatus = 'pending' | 'loading' | 'scraping' | 'stopped' | 'completed';

export interface WebnovelChapterItem {
  chapterId: string;
  chapterIndex: number;
  chapterName: string;
}

export interface WebnovelVolumeItem {
  volumeId: number;
  volumeName: string;
  chapterItems: WebnovelChapterItem[];
}

export interface WebnovelResponse {
  code: number;
  msg: string;
  data?: {
    volumeItems: WebnovelVolumeItem[];
  };
}

export interface ScraperMetadata {
  nid: string;
  chapterCount: number;
  totalChapters: number;
  status: ScraperTaskStatus;
}

export type Parser = (html: string) => { content: EditorContent[]; nextChapterURL: string | null };

/**
 * Declaring the constants.
 */
const logger = global.getLogger('service:scraper');
const webnovelChapterListURL = 'https://www.webnovel.com/go/pcm/chapter/get-chapter-list';

/**
 * Parsers
 */
const boxnovelParser: Parser = (html) => {
  const $ = cheerio.load(html);
  const contentText = $('reading-content').text();
  const contentArr = contentText.split('\n').filter((para) => para.trim());
  const content = contentArr.map((str) => ({ tag: 'p', text: DBUtils.formatText(str) } as EditorContent));
  const nextChapterURL = $('.next_page').attr('href') || null;
  return { content, nextChapterURL };
};

const novelFullParser: Parser = (html) => {
  const $ = cheerio.load(html);
  const elementArr = $('#chapter-content p').toArray();
  const contentArr = elementArr.map((element) => $(element).text()).filter((para) => para.trim());
  const content = contentArr.map((str) => ({ tag: 'p', text: DBUtils.formatText(str) } as EditorContent));
  const nextChapterURL = $('#next_chap').attr('href') || null;
  return { content, nextChapterURL: nextChapterURL && `https://novelfull.com${nextChapterURL}` };
};

/**
 * Creates the scraping task
 * @class
 */
export class Scraper {
  private static tasks: Record<string, Scraper> = {};

  private startURL?: string;
  private webnovelCookie?: string;
  private webnovelBookId?: string;

  private parser?: Parser;
  private taskStatus: ScraperTaskStatus = 'pending';
  private chapterCount = 0;
  private chapterList: WebnovelChapterItem[] = [];

  constructor(private nid: string, private vid?: string) {}

  /**
   * Gets the scraper task for the given novel.
   */
  public static getTask(nid: string): Scraper | null {
    return Scraper.tasks[nid] || null;
  }

  /**
   * Returns the pareser function based on the url.
   */
  private static getParser(url: string) {
    if (url.match(/^https:\/\/boxnovel.com\/novel\/[a-zA-Z0-9\-_]{3,100}\/chapter-[0-9]+$/)) return boxnovelParser;
    else if (url.match(/^https:\/\/novelfull.com\/[a-zA-Z0-9\-_]{3,100}\/chapter-[0-9]{1,4}[a-zA-Z0-9\-]*.html$/)) return novelFullParser;
    throw ServerErrors.SCRAPER_URL_INVALID;
  }

  setCookie(cookie?: string) {
    this.webnovelCookie = cookie;
    return this;
  }

  setStartURL(startURL?: string) {
    this.startURL = startURL;
    return this;
  }

  /**
   * Loads the chapter list from webnovel.
   */
  private async loadChapterList() {
    const query = new URLSearchParams();
    const csrfToken = this.webnovelCookie!.split(';').find((cookieItem) => cookieItem.includes('_csrfToken'));
    if (!csrfToken) throw ServerErrors.WEBNOVEL_METADATA_INVALID;
    query.set('_csrfToken', csrfToken.replace('_csrfToken=', '').trim());
    query.set('bookId', this.webnovelBookId!);
    query.set('_', Date.now().toString());
    const url = `${webnovelChapterListURL}?${query.toString()}`;
    const response: AxiosResponse<WebnovelResponse> = await axios.get(url, { headers: { Cookie: this.webnovelCookie } });
    const volumes = response.data.data?.volumeItems;
    if (!volumes) throw ServerErrors.WEBNOVEL_METADATA_INVALID;
    this.chapterList = volumes.reduce((acc, volume) => [...acc, ...volume.chapterItems], this.chapterList);
  }

  /**
   * Creates a chapter for the novel.
   */
  private async createChapter(content: EditorContent[]) {
    const cid = DBUtils.generateUUID();
    const matureContent = DBUtils.isMatureContent(content);
    const title = this.chapterList[this.chapterCount].chapterName;
    const index = ++this.chapterCount;
    await chapterModel.create({ nid: this.nid, cid, index, title, content: content, matureContent, vid: this.vid });
    if (this.vid) {
      await novelModel.updateOne({ nid: this.nid, 'volumes.vid': this.vid }, { $inc: { chapterCount: 1, 'volumes.$.chapterCount': 1 }, $set: { lastUpdated: new Date() } });
    } else {
      await novelModel.updateOne({ nid: this.nid }, { $inc: { chapterCount: 1 }, $set: { lastUpdated: new Date() } });
    }
  }

  /**
   * Scrapes the chapter content from the website.
   */
  private async scrape() {
    logger.info(`Started scraping`);
    this.taskStatus = 'scraping';
    try {
      let chapterURL: string | null = this.startURL!;
      while (chapterURL && this.taskStatus === 'scraping') {
        const response = await axios.get(chapterURL);
        const result = this.parser!(response.data);
        await this.createChapter(result.content);
        chapterURL = result.nextChapterURL;
      }
    } catch (err) {
      logger.error(err);
    }
    this.taskStatus = 'completed';
  }

  /**
   * Gets the metadata of the scraper task.
   */
  getMetadata(): ScraperMetadata {
    const metadata = {
      nid: this.nid,
      chapterCount: this.chapterCount,
      totalChapters: this.chapterList.length,
      status: this.taskStatus
    };
    if (this.taskStatus === 'completed' || this.taskStatus === 'stopped') delete Scraper.tasks[this.nid];
    return metadata;
  }

  /**
   * Stops the scraping process and returns the metadata.
   */
  stop() {
    this.taskStatus = 'stopped';
    return this.getMetadata();
  }

  /**
   * Starts the scraping process and returns the metadata.
   */
  async start() {
    this.taskStatus = 'loading';
    const novel = await novelModel.findOne({ nid: this.nid }, '-cover').lean();
    if (!novel?.webnovelBookId) throw ServerErrors.WEBNOVEL_BOOK_ID_REQUIRED;
    if (!this.startURL) throw ServerErrors.SCRAPER_START_URL_REQUIRED;
    if (!this.webnovelCookie) throw ServerErrors.WEBNOVEL_COOKIE_REQUIRED;
    this.webnovelBookId = novel.webnovelBookId;
    this.parser = Scraper.getParser(this.startURL);
    Scraper.tasks[this.nid] = this;
    this.chapterCount = await chapterModel.countDocuments({ nid: this.nid });
    await this.loadChapterList();
    this.scrape();
    return this.getMetadata();
  }
}
