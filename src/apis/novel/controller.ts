/**
 * Importing npm packages.
 */
import { chapterModel, novelModel, DBUtils, userModel } from '@leanderpaul/shadow-novel-database';
import { removeKeys, trimObject } from '@leanderpaul/ts-utils';

/**
 * Importing user defined packages.
 */
import { ServerErrors } from '../../services/index';
import { handlePagination } from './utils';

/**
 * Importing and defining types.
 */
import type { FilterQuery } from 'mongoose';
import type { Novel } from '@leanderpaul/shadow-novel-database';
import type { Request, Response } from 'express-serve-static-core';
import type { CreateNovel, CreateVolume, DeleteVolume, ListNovels, GetNovel, UpdateNovel, UpdateVolume, LatestUpdatesAggregate, GetLatestUpdates } from './types';

/**
 * Declaring the constants.
 */
export async function createNovel(req: Request<any, any, CreateNovel['body']>, res: Response<CreateNovel['response']>) {
  try {
    const body = req.body;
    const user = req.iam.getUser()!;
    const novelInput = removeKeys(body, ['type']);
    const volumes = body.type === 'book' ? [DBUtils.generateVolume()] : undefined;
    const desc = body.desc.map((para) => ({ ...para, text: DBUtils.formatText(para.text) }));
    const novel = await novelModel.create({ uid: user.uid, nid: DBUtils.generateUUID(), ...novelInput, volumes, desc });
    return res.status(201).json(removeKeys(novel.toObject(), ['_id']));
  } catch (err) {
    return res.error(err);
  }
}

export async function listNovels(req: Request<any, any, any, ListNovels['query']>, res: Response<ListNovels['response']>) {
  try {
    const reqQuery = req.query;
    const dbQuery: FilterQuery<Novel> = {};
    if (reqQuery.title) dbQuery.title = new RegExp(reqQuery.title, 'i');
    if (reqQuery.genre) dbQuery.genre = reqQuery.genre;
    if (reqQuery.status) dbQuery.status = reqQuery.status;
    if (reqQuery.tags) dbQuery.tags = { $all: reqQuery.tags };
    if (reqQuery.uid) dbQuery.uid = reqQuery.uid;
    const pagination = handlePagination(reqQuery);
    const novelsPromise = novelModel.find(dbQuery, 'nid title cover desc genre status');
    novelsPromise.sort(pagination.sort).skip(pagination.offset).limit(pagination.limit);
    const [novels, novelCount] = await Promise.all([novelsPromise.lean(), novelModel.countDocuments(dbQuery)]);
    return res.status(200).json({ pagination: { ...pagination, totalCount: novelCount }, items: novels });
  } catch (err) {
    return res.error(err);
  }
}

export async function getNovel(req: Request<GetNovel['url']>, res: Response<GetNovel['response']>) {
  try {
    const { nid } = req.params;
    const user = req.iam.getUser();
    const novel = await novelModel.findOne({ nid }).lean();
    if (!novel) throw ServerErrors.NOVEL_NOT_FOUND;
    const chapters = await chapterModel.find({ nid }, 'cid index title createdAt').sort({ index: 1 }).lean();
    const author = await userModel.findOne({ uid: novel.uid }, 'uid username').lean();
    if (!user || user.uid != novel.uid) await novelModel.updateOne({ nid }, { $inc: { views: 1 } });
    return res.json({ ...novel, chapters, author: author!.username });
  } catch (err) {
    return res.error(err);
  }
}

export async function updateNovel(req: Request<UpdateNovel['url'], any, UpdateNovel['body']>, res: Response<UpdateNovel['response']>) {
  try {
    const { nid } = req.params;
    const updatedValues = trimObject(req.body);
    const result = await novelModel.updateOne({ nid }, { $set: updatedValues });
    if (result.n === 0) throw ServerErrors.NOVEL_NOT_FOUND;
    const novel = await novelModel.findOne({ nid }).lean();
    return res.json(novel!);
  } catch (err) {
    return res.error(err);
  }
}

export async function getLatestUpdates(_req: Request, res: Response<GetLatestUpdates['response']>) {
  try {
    const chapters = await novelModel.aggregate<LatestUpdatesAggregate>([
      { $sort: { lastUpdated: -1 } },
      { $lookup: { from: 'users', localField: 'uid', foreignField: 'uid', as: 'author' } },
      { $unwind: { path: '$author' } },
      {
        $lookup: {
          from: 'chapters',
          let: { nid: '$nid', index: '$chapterCount' },
          pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$nid', '$$nid'] }, { $eq: ['$index', '$$index'] }] } } }],
          as: 'chapter'
        }
      },
      { $unwind: { path: '$chapter' } },
      { $project: { _id: 0, nid: 1, title: 1, genre: 1, author: { uid: 1, username: 1 }, chapter: { cid: 1, index: 1, title: 1, createdAt: 1 } } }
    ]);
    return res.json({ items: chapters });
  } catch (err) {
    return res.error(err);
  }
}

export async function createVolume(req: Request<CreateVolume['url'], any, CreateVolume['body']>, res: Response<CreateVolume['response']>) {
  try {
    const { nid } = req.params;
    const { name } = req.body;
    const novel = req.iam.getNovel()!;
    if (!novel.volumes) throw ServerErrors.NOVEL_VOLUME_INVALID;
    const volume = DBUtils.generateVolume(name);
    await novelModel.updateOne({ nid }, { $push: { volumes: volume } });
    return res.status(201).json(volume);
  } catch (err) {
    return res.error(err);
  }
}

export async function updateVolume(req: Request<UpdateVolume['url'], any, UpdateVolume['body']>, res: Response<UpdateVolume['response']>) {
  try {
    const params = req.params;
    const body = req.body;
    const novel = req.iam.getNovel()!;
    if (!novel.volumes) throw ServerErrors.NOVEL_VOLUME_INVALID;
    const volume = novel.volumes.find((volume) => volume.vid === params.vid);
    if (!volume) throw ServerErrors.NOVEL_VOLUME_NOT_FOUND;
    await novelModel.updateOne({ nid: params.nid, 'volumes.vid': params.vid }, { $set: { 'volumes.$.name': body.name } });
    return res.json({ ...volume, name: body.name });
  } catch (err) {
    return res.error(err);
  }
}

export async function deleteVolume(req: Request<DeleteVolume['url']>, res: Response) {
  try {
    const params = req.params;
    const novel = req.iam.getNovel()!;
    if (!novel.volumes) throw ServerErrors.NOVEL_VOLUME_INVALID;
    const volume = novel.volumes.find((volume) => volume.vid === params.vid);
    if (!volume) throw ServerErrors.NOVEL_VOLUME_NOT_FOUND;
    await novelModel.updateOne({ nid: params.nid }, { $pull: { volumes: { vid: params.vid } } });
    return res.status(204).send();
  } catch (err) {
    return res.error(err);
  }
}
