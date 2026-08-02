import { Request, Response, NextFunction } from 'express';
import db from '../db/knex';
import { createTopicSchema, updateTopicSchema } from '../schemas/topics';
import { AuthRequest } from '../middleware/authenticate';

export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const query = db('topics as t')
      .join('subjects as s', 't.subject_id', 's.id')
      .where('s.user_id', userId)
      .select('t.*')
      .orderBy('t.created_at', 'desc');
    if (req.query.subject_id) query.where('t.subject_id', req.query.subject_id);
    res.json(await query);
  } catch (err) {
    next(err);
  }
}

export async function show(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const topic = await db('topics as t')
      .join('subjects as s', 't.subject_id', 's.id')
      .where('t.id', req.params.id)
      .where('s.user_id', userId)
      .select('t.*')
      .first();
    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }
    res.json(topic);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const data = createTopicSchema.parse(req.body);
    const subject = await db('subjects').where({ id: data.subject_id, user_id: userId }).first();
    if (!subject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }
    const [topic] = await db('topics').insert(data).returning('*');
    res.status(201).json(topic);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const data = updateTopicSchema.parse(req.body);
    const existing = await db('topics as t')
      .join('subjects as s', 't.subject_id', 's.id')
      .where('t.id', req.params.id)
      .where('s.user_id', userId)
      .select('t.id')
      .first();
    if (!existing) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }
    const [topic] = await db('topics').where({ id: req.params.id }).update(data).returning('*');
    res.json(topic);
  } catch (err) {
    next(err);
  }
}

export async function destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const existing = await db('topics as t')
      .join('subjects as s', 't.subject_id', 's.id')
      .where('t.id', req.params.id)
      .where('s.user_id', userId)
      .select('t.id')
      .first();
    if (!existing) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }
    await db('topics').where({ id: req.params.id }).delete();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
