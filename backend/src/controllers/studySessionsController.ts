import { Request, Response, NextFunction } from 'express';
import db from '../db/knex';
import { createStudySessionSchema, updateStudySessionSchema } from '../schemas/studySessions';
import { AuthRequest } from '../middleware/authenticate';

export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const query = db('study_sessions as ss')
      .join('kanban_cards as kc', 'ss.card_id', 'kc.id')
      .join('kanban_columns as col', 'kc.column_id', 'col.id')
      .where('col.user_id', userId)
      .select('ss.*')
      .orderBy('ss.started_at', 'desc');
    if (req.query.card_id) query.where('ss.card_id', req.query.card_id);
    if (req.query.date) query.whereRaw("DATE(ss.started_at AT TIME ZONE 'UTC') = ?", [String(req.query.date)]);
    res.json(await query);
  } catch (err) {
    next(err);
  }
}

export async function show(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const session = await db('study_sessions as ss')
      .join('kanban_cards as kc', 'ss.card_id', 'kc.id')
      .join('kanban_columns as col', 'kc.column_id', 'col.id')
      .where('ss.id', req.params.id)
      .where('col.user_id', userId)
      .select('ss.*')
      .first();
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
    const userId = (req as AuthRequest).userId;
    const data = createStudySessionSchema.parse(req.body);
    const card = await db('kanban_cards as kc')
      .join('kanban_columns as col', 'kc.column_id', 'col.id')
      .where('kc.id', data.card_id)
      .where('col.user_id', userId)
      .select('kc.id')
      .first();
    if (!card) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }
    const [session] = await db('study_sessions').insert(data).returning('*');
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const data = updateStudySessionSchema.parse(req.body);
    const existing = await db('study_sessions as ss')
      .join('kanban_cards as kc', 'ss.card_id', 'kc.id')
      .join('kanban_columns as col', 'kc.column_id', 'col.id')
      .where('ss.id', req.params.id)
      .where('col.user_id', userId)
      .select('ss.id')
      .first();
    if (!existing) {
      res.status(404).json({ error: 'Study session not found' });
      return;
    }
    const [session] = await db('study_sessions').where({ id: req.params.id }).update(data).returning('*');
    res.json(session);
  } catch (err) {
    next(err);
  }
}

export async function destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const existing = await db('study_sessions as ss')
      .join('kanban_cards as kc', 'ss.card_id', 'kc.id')
      .join('kanban_columns as col', 'kc.column_id', 'col.id')
      .where('ss.id', req.params.id)
      .where('col.user_id', userId)
      .select('ss.id')
      .first();
    if (!existing) {
      res.status(404).json({ error: 'Study session not found' });
      return;
    }
    await db('study_sessions').where({ id: req.params.id }).delete();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
