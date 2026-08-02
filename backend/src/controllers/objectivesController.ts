import { Request, Response, NextFunction } from 'express';
import db from '../db/knex';
import { createObjectiveSchema, updateObjectiveSchema } from '../schemas/objectives';
import { AuthRequest } from '../middleware/authenticate';

export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const query = db('objectives as o')
      .join('subjects as s', 'o.subject_id', 's.id')
      .where('s.user_id', userId)
      .select('o.*')
      .orderBy('o.created_at', 'desc');
    if (req.query.subject_id) query.where('o.subject_id', req.query.subject_id);
    if (req.query.status) query.where('o.status', req.query.status);
    res.json(await query);
  } catch (err) {
    next(err);
  }
}

export async function show(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const objective = await db('objectives as o')
      .join('subjects as s', 'o.subject_id', 's.id')
      .where('o.id', req.params.id)
      .where('s.user_id', userId)
      .select('o.*')
      .first();
    if (!objective) {
      res.status(404).json({ error: 'Objective not found' });
      return;
    }
    res.json(objective);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const data = createObjectiveSchema.parse(req.body);
    const subject = await db('subjects').where({ id: data.subject_id, user_id: userId }).first();
    if (!subject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }
    const [objective] = await db('objectives').insert(data).returning('*');
    res.status(201).json(objective);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const data = updateObjectiveSchema.parse(req.body);
    const existing = await db('objectives as o')
      .join('subjects as s', 'o.subject_id', 's.id')
      .where('o.id', req.params.id)
      .where('s.user_id', userId)
      .select('o.id')
      .first();
    if (!existing) {
      res.status(404).json({ error: 'Objective not found' });
      return;
    }
    const [objective] = await db('objectives').where({ id: req.params.id }).update(data).returning('*');
    res.json(objective);
  } catch (err) {
    next(err);
  }
}

export async function destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const existing = await db('objectives as o')
      .join('subjects as s', 'o.subject_id', 's.id')
      .where('o.id', req.params.id)
      .where('s.user_id', userId)
      .select('o.id')
      .first();
    if (!existing) {
      res.status(404).json({ error: 'Objective not found' });
      return;
    }
    await db('objectives').where({ id: req.params.id }).delete();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
