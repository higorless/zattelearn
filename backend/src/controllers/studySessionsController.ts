import { Request, Response, NextFunction } from 'express';
import db from '../db/knex';
import { createStudySessionSchema, updateStudySessionSchema } from '../schemas/studySessions';

export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = db('study_sessions').select('*').orderBy('started_at', 'desc');
    if (req.query.card_id) {
      query.where({ card_id: req.query.card_id });
    }
    if (req.query.date) {
      query.whereRaw("DATE(started_at AT TIME ZONE 'UTC') = ?", [String(req.query.date)]);
    }
    res.json(await query);
  } catch (err) {
    next(err);
  }
}

export async function show(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = await db('study_sessions').where({ id: req.params.id }).first();
    if (!session) {
      res.status(404).json({ error: 'Study session not found' });
      return;
    }
    res.json(session);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createStudySessionSchema.parse(req.body);
    const [session] = await db('study_sessions').insert(data).returning('*');
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateStudySessionSchema.parse(req.body);
    const [session] = await db('study_sessions').where({ id: req.params.id }).update(data).returning('*');
    if (!session) {
      res.status(404).json({ error: 'Study session not found' });
      return;
    }
    res.json(session);
  } catch (err) {
    next(err);
  }
}

export async function destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const count = await db('study_sessions').where({ id: req.params.id }).delete();
    if (!count) {
      res.status(404).json({ error: 'Study session not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
