/**
 * Importing npm packages.
 */
import { novelModel } from '@leanderpaul/shadow-novel-database';

/**
 * Importing user defined packages.
 */
import { Scraper } from '../../services/index';

/**
 * Importing and defining types.
 */
import type { Request, Response } from 'express-serve-static-core';
import type { ScrapeNovel, ScraperTaskStatus, UpdateScraperTask } from './types';

/**
 * Declaring the constants.
 */

export async function scrapeNovel(req: Request<ScrapeNovel['url'], any, ScrapeNovel['body']>, res: Response<ScrapeNovel['response']>) {
  try {
    const body = req.body;
    const user = req.iam.getUser()!;
    const novel = req.iam.getNovel()!;
    const volumes = novel.volumes;
    const vid = volumes && volumes[volumes.length - 1].vid;
    const scraper = new Scraper(novel.nid, vid);
    scraper.setCookie(user.webnovelCookie).setStartURL(body.startURL);
    const metadata = await scraper.start();
    return res.json(metadata);
  } catch (err) {
    return res.error(err);
  }
}

export async function getScraperTaskStatus(req: Request<ScraperTaskStatus['url']>, res: Response<ScraperTaskStatus['response']>) {
  try {
    const { nid } = req.params;
    const metadata = Scraper.getTask(nid)?.getMetadata() || null;
    return res.json(metadata);
  } catch (err) {
    return res.error(err);
  }
}

export async function updateScraperTask(req: Request<UpdateScraperTask['url'], any, UpdateScraperTask['body']>, res: Response<UpdateScraperTask['response']>) {
  try {
    const { nid } = req.params;
    const metadata = Scraper.getTask(nid)?.stop() || null;
    return res.json(metadata);
  } catch (err) {
    return res.error(err);
  }
}
