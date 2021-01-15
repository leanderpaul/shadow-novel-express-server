/**
 * Importing npm packages.
 */
import { chapterModel, ChapterUpdate, novelModel } from '@leanderpaul/shadow-novel-database';

/**
 * Importing user defined packages.
 */
import { getChapterFilter, pickKeys, trimObject } from '../../utils/lib';

/**
 * Importing and defining types.
 */
import type { Request, Response } from 'express-serve-static-core';
import type { CreateChapter, DeleteChapter, GetChapter, GetChapters, UpdateChapter } from './novel-chapter.types';

/**
 * Declaring the constants.
 */

export async function createChapter(req: Request<CreateChapter['url'], any, CreateChapter['body']>, res: Response<CreateChapter['response']>) {
  const { nid } = req.params;
  const body = req.body;
  const novel = await novelModel.findById(nid, ['nid', 'chapterCount', 'volumes']);
  if (!novel) return res.status(404).json({ code: 'NOVEL_NOT_FOUND', msg: 'The novel does not exist !' });
  const volume = novel.volumes.find((value) => value.vid === body.vid);
  if (!volume) return res.status(404).json({ code: 'VOLUME_NOT_FOUND', msg: 'The novel volume does not exist !' });
  const chapter = await chapterModel.createChapter({ nid, ...body, matureContent: body.matureContent === 'true' });
  return res.status(201).json(chapter);
}

export async function getChapters(req: Request<GetChapters['url'], any, any, GetChapters['query']>, res: Response<GetChapters['response']>) {
  const { nid } = req.params;
  const filter = getChapterFilter(req.query);
  const chapters = await chapterModel.findChapters(nid, filter);
  const chapterCount = await chapterModel.countChapters(nid);
  return res.status(200).json({ chapters, pagination: { offset: filter.offset, limit: filter.limit || chapterCount, totalCount: chapterCount } });
}

export async function getChapter(req: Request<GetChapter['url']>, res: Response<GetChapter['response']>) {
  const { cid, nid } = req.params;
  const chapter = await chapterModel.findById({ nid, cid });
  if (!chapter) return res.status(404).json({ code: 'CHAPTER_NOT_FOUND', msg: 'The novel chapter does not exist !' });
  return res.status(200).json(chapter);
}

export async function updateChapter(req: Request<UpdateChapter['url'], any, UpdateChapter['body']>, res: Response<UpdateChapter['response']>) {
  const { cid, nid } = req.params;
  const updatedContent = trimObject(req.body);
  const update: ChapterUpdate = { ...pickKeys(updatedContent, ['title', 'content']) };
  if (updatedContent.matureContent === 'true' || updatedContent.matureContent === 'false') update.matureContent = updatedContent.matureContent === 'true' ? true : false;
  const result = await chapterModel.updateChapter({ cid, nid }, update);
  if (result === 'CHAPTER_NOT_FOUND') return res.status(404).json({ code: 'CHAPTER_NOT_FOUND', msg: 'The novel chapter does not exist !' });
  const chapter = await chapterModel.findById({ nid, cid });
  return res.status(200).json(chapter!);
}

export async function deleteChapter(req: Request<DeleteChapter['url']>, res: Response) {
  const { cid, nid } = req.params;
  const result = await chapterModel.deleteChapter({ cid, nid });
  if (result === 'CHAPTER_NOT_FOUND') return res.status(404).json({ code: 'CHAPTER_NOT_FOUND', msg: 'The novel chapter does not exist !' });
  return res.status(200);
}
