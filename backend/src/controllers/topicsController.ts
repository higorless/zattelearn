import { Request, Response, NextFunction } from 'express';
import db from '../db/knex';
import { createTopicSchema, updateTopicSchema } from '../schemas/topics';

export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = db('topics').select('*').orderBy('created_at', 'desc');
    if (req.query.subject_id) {
      query.where({ subject_id: req.query.subject_id });
    }
    res.json(await query);
  } catch (err) {
    next(err);
  }
}

export async function show(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const topic = await db('topics').where({ id: req.params.id }).first();
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
    const data = createTopicSchema.parse(req.body);
    const [topic] = await db('topics').insert(data).returning('*');
    res.status(201).json(topic);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateTopicSchema.parse(req.body);
    const [topic] = await db('topics').where({ id: req.params.id }).update(data).returning('*');
    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }
    res.json(topic);
  } catch (err) {
    next(err);
  }
}

export async function destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const count = await db('topics').where({ id: req.params.id }).delete();
    if (!count) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
