/**
 * Importing npm packages.
 */
import { chapterModel, novelModel, DBUtils } from '@leanderpaul/shadow-novel-database';
import { pickKeys, trimObject, removeKeys } from '@leanderpaul/ts-utils';

/**
 * Importing user defined packages.
 */
import { ServerErrors } from '../../services/index';
import { handlePagination } from './utils';

/**
 * Importing and defining types.
 */
import type { FilterQuery, UpdateQuery } from 'mongoose';
import type { NovelChapter, Novel } from '@leanderpaul/shadow-novel-database';
import type { Request, Response } from 'express-serve-static-core';
import type { CreateChapter, DeleteChapter, GetChapter, DownloadChapters, UpdateChapter, ListChapters } from './types';

type NovelUpdate = { filter: FilterQuery<Novel>; update: UpdateQuery<Novel> };

/**
 * Declaring the constants.
 */

export async function createChapter(req: Request<CreateChapter['url'], any, CreateChapter['body']>, res: Response<CreateChapter['response']>) {
  try {
    const { nid } = req.params;
    const body = req.body;
    const novel = req.iam.getNovel()!;
    const index = novel.chapterCount + 1;
    const newChapter: Omit<NovelChapter, 'createdAt'> = { nid, cid: DBUtils.generateUUID(), ...pickKeys(body, ['content', 'title', 'matureContent']), index };
    const novelUpdate: NovelUpdate = { filter: { nid }, update: { $inc: { chapterCount: 1 }, $set: { lastUpdated: new Date() } } };
    if (novel.volumes) {
      /** Novel type = Book */
      const volume = novel.volumes.find((value) => value.vid === body.vid);
      if (!volume) throw ServerErrors.NOVEL_VOLUME_NOT_FOUND;
      newChapter.vid = volume.vid;
      novelUpdate.filter['volumes.vid'] = volume.vid;
      novelUpdate.update.$inc = { ...novelUpdate.update.$inc, 'volumes.$.chapterCount': 1 };
    }
    const chapter = await chapterModel.create(newChapter);
    await novelModel.updateOne(novelUpdate.filter, novelUpdate.update);
    return res.status(201).json(removeKeys(chapter.toObject(), ['_id']));
  } catch (err) {
    return res.error(err);
  }
}

export async function listChapters(req: Request<DownloadChapters['url'], any, any, DownloadChapters['query']>, res: Response<DownloadChapters['response']>) {
  try {
    const { nid } = req.params;
    const pagination = handlePagination(req.query);
    const chaptersPromise = chapterModel.find({ nid }).sort(pagination.sort).limit(pagination.limit);
    const [chapters, chapterCount] = await Promise.all([chaptersPromise.lean(), chapterModel.countDocuments({ nid })]);
    return res.json({ pagination: { ...pagination, totalCount: chapterCount }, items: chapters });
  } catch (err) {
    return res.error(err);
  }
}

export async function getChapter(req: Request<GetChapter['url']>, res: Response<GetChapter['response']>) {
  try {
    const params = req.params;
    const chapter = await chapterModel.findOne(params);
    if (!chapter) throw ServerErrors.NOVEL_CHAPTER_NOT_FOUND;
    return res.json(chapter);
  } catch (err) {
    return res.error(err);
  }
}

export async function updateChapter(req: Request<UpdateChapter['url'], any, UpdateChapter['body']>, res: Response<UpdateChapter['response']>) {
  try {
    const params = req.params;
    const updatedContent = trimObject(req.body);
    const result = await chapterModel.updateOne(params, { $set: updatedContent });
    if (result.n === 0) throw ServerErrors.NOVEL_CHAPTER_NOT_FOUND;
    const chapter = await chapterModel.findOne(params);
    return res.json(chapter!);
  } catch (err) {
    return res.error(err);
  }
}

export async function deleteChapter(req: Request<DeleteChapter['url']>, res: Response) {
  try {
    const params = req.params;
    const novel = req.iam.getNovel()!;
    const novelUpdate: { filter: FilterQuery<Novel>; update: UpdateQuery<Novel> } = { filter: { nid: params.nid }, update: { $inc: { chapterCount: -1 } } };
    const chapter = await chapterModel.findOne(params, 'nid cid vid index').lean();
    if (!chapter) throw ServerErrors.NOVEL_CHAPTER_NOT_FOUND;
    if (chapter.vid) {
      novelUpdate.filter['volumes.vid'] = chapter.vid;
      novelUpdate.update.$inc = { ...novelUpdate.update.$inc, 'volumes.$.chapterCount': -1 };
    }
    await chapterModel.deleteOne(params);
    if (chapter.index < novel.chapterCount) await chapterModel.updateMany({ nid: params.nid, index: { $gt: chapter.index } }, { $inc: { index: -1 } });
    await novelModel.updateOne(novelUpdate.filter, novelUpdate.update);
    return res.status(204).json();
  } catch (err) {
    return res.error(err);
  }
}
