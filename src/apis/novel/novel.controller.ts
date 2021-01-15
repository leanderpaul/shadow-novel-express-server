/**
 * Importing npm packages.
 */
import { chapterModel, novelModel, dbUtils } from '@leanderpaul/shadow-novel-database';

/**
 * Importing user defined packages.
 */
import { getNovelFilter, isNovelGenre, isNovelStatus, isNovelTags, pickKeys, trimObject } from '../../utils/lib';

/**
 * Importing and defining types.
 */
import type { Request, Response } from 'express-serve-static-core';
import { CreateNovel, CreateVolume, DeleteVolume, FindNovel, GetNovel, UpdateNovel, UpdateVolume } from './novel.types';

/**
 * Declaring the constants.
 */

export async function createNovel(req: Request<any, any, CreateNovel['body']>, res: Response<CreateNovel['response']>) {
  const body = req.body;
  const user = req.user;
  if (!isNovelGenre(body.genre)) return res.status(400).json({ code: 'INVALID_NOVEL_GENRE', msg: 'The novel genre provided is invalid !' });
  if (!isNovelStatus(body.status)) return res.status(400).json({ code: 'INVALID_NOVEL_STATUS', msg: 'The novel status provided is invalid !' });
  if (!isNovelTags(body.tags)) return res.status(400).json({ code: 'INVALID_NOVEL_TAGS', msg: 'The novel tags provided is invalid !' });
  const novel = await novelModel.createNovel({ author: user.username, ...body });
  return res.status(201).json(novel);
}

export async function listNovels(req: Request<any, any, any, FindNovel['query']>, res: Response<FindNovel['response']>) {
  let query = pickKeys(req.query, ['title', 'author', 'genre', 'tags', 'status']);
  let filter = pickKeys(req.query, ['sortField', 'sortOrder', 'offset', 'limit']);
  if (!isNovelGenre(query.genre)) delete query.genre;
  if (!isNovelStatus(query.status)) delete query.status;
  query = trimObject(query);
  const novelFilter = getNovelFilter(filter);
  const novels = await novelModel.findNovels(query, novelFilter, ['nid', 'title', 'cover', 'desc', 'genre', 'status']);
  const novelCount = await novelModel.countNovels(query);
  return res.status(200).json({ pagination: { ...pickKeys(novelFilter, ['limit', 'offset']), totalCount: novelCount }, novels });
}

export async function getNovel(req: Request<GetNovel['url']>, res: Response<GetNovel['response']>) {
  const { nid } = req.params;
  const novel = await novelModel.findById(nid);
  if (!novel) return res.status(404).json({ code: 'NOVEL_NOT_FOUND', msg: 'Novel does not exist !' });
  const chapters = await chapterModel.findChapters(nid, { offset: 0, sortOrder: 'asc' }, ['cid', 'index', 'title', 'createdAt']);
  novelModel.updateNovel({ nid }, { $inc: { views: 1 } });
  return res.status(200).json({ ...novel, chapters });
}

export async function updateNovel(req: Request<UpdateNovel['url'], any, UpdateNovel['body']>, res: Response<UpdateNovel['response']>) {
  const { nid } = req.params;
  const updatedValues = trimObject(req.body);
  const result = await novelModel.updateNovel({ nid }, { $set: updatedValues });
  if (result === 'NOVEL_NOT_FOUND') return res.status(404).json({ code: 'NOVEL_NOT_FOUND', msg: 'Novel does not exist !' });
  const novel = await novelModel.findById(nid);
  return res.status(200).json(novel!);
}

export async function createVolume(req: Request<CreateVolume['url'], any, CreateVolume['body']>, res: Response<CreateVolume['response']>) {
  const { nid } = req.params;
  const { name } = req.body;
  const volume = dbUtils.generateVolume(name) as any;
  const result = await novelModel.updateNovel({ nid }, { $push: { volumes: volume } });
  if (result === 'NOVEL_NOT_FOUND') return res.status(404).json({ code: 'NOVEL_NOT_FOUND', msg: 'Novel does not exist !' });
  const novel = await novelModel.findById(nid);
  return res.status(201).json(novel!);
}

export async function updateVolume(req: Request<UpdateVolume['url'], any, UpdateVolume['body']>, res: Response<UpdateVolume['response']>) {
  const { nid, vid } = req.params;
  const result = await novelModel.updateNovel({ nid, vid }, { 'volumes.$.name': req.body.name });
  if (result === 'NOVEL_NOT_FOUND') return res.status(404).json({ code: 'NOVEL_NOT_FOUND', msg: 'Novel does not exist !' });
  const novel = await novelModel.findById(nid);
  return res.status(200).json(novel!);
}

export async function deleteVolume(req: Request<DeleteVolume['url']>, res: Response<DeleteVolume['response']>) {
  const { nid, vid } = req.params;
  const result = await novelModel.updateNovel({ nid }, { $pull: { volumes: { vid } } });
  if (result === 'NOVEL_NOT_FOUND') return res.status(404).json({ code: 'NOVEL_NOT_FOUND', msg: 'Novel does not exist !' });
  const novel = await novelModel.findById(nid);
  return res.status(201).json(novel!);
}
