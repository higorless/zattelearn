import { Request, Response, NextFunction } from 'express';
import db from '../db/knex';
import { createKanbanCardSchema, updateKanbanCardSchema } from '../schemas/kanbanCards';
import { AuthRequest } from '../middleware/authenticate';

export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;

    const query = db('kanban_cards as c')
      .join('kanban_columns as col', 'c.column_id', 'col.id')
      .where('col.user_id', userId)
      .select('c.*')
      .orderBy('c.position', 'asc');

    if (req.query.column_id) query.where('c.column_id', req.query.column_id);
    if (req.query.subject_id) query.where('c.subject_id', req.query.subject_id);

    res.json(await query);
  } catch (err) {
    next(err);
  }
}

export async function show(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const card = await db('kanban_cards as c')
      .join('kanban_columns as col', 'c.column_id', 'col.id')
      .leftJoin('subjects as s', 'c.subject_id', 's.id')
      .leftJoin('topics as t', 'c.topic_id', 't.id')
      .where('c.id', req.params.id)
      .where('col.user_id', userId)
      .select(
        'c.*',
        db.raw(`CASE WHEN s.id IS NOT NULL THEN json_build_object('id', s.id, 'name', s.name, 'color', s.color) ELSE NULL END as subject`),
        db.raw(`CASE WHEN t.id IS NOT NULL THEN json_build_object('id', t.id, 'name', t.name) ELSE NULL END as topic`),
      )
      .first();
    if (!card) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }
    res.json(card);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const data = createKanbanCardSchema.parse(req.body);

    const column = await db('kanban_columns').where({ id: data.column_id, user_id: userId }).first();
    if (!column) {
      res.status(404).json({ error: 'Column not found' });
      return;
    }

    if (data.position === undefined) {
      const [{ max }] = await db('kanban_cards').where({ column_id: data.column_id }).max('position as max');
      data.position = (max ?? -1) + 1;
    }

    const [card] = await db('kanban_cards').insert(data).returning('*');
    res.status(201).json(card);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const data = updateKanbanCardSchema.parse(req.body);

    const existing = await db('kanban_cards as c')
      .join('kanban_columns as col', 'c.column_id', 'col.id')
      .where('c.id', req.params.id)
      .where('col.user_id', userId)
      .select('c.id')
      .first();
    if (!existing) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    if (data.column_id) {
      const col = await db('kanban_columns').where({ id: data.column_id, user_id: userId }).first();
      if (!col) {
        res.status(404).json({ error: 'Column not found' });
        return;
      }
    }

    const [card] = await db('kanban_cards').where({ id: req.params.id }).update(data).returning('*');
    res.json(card);
  } catch (err) {
    next(err);
  }
}

export async function destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;

    const existing = await db('kanban_cards as c')
      .join('kanban_columns as col', 'c.column_id', 'col.id')
      .where('c.id', req.params.id)
      .where('col.user_id', userId)
      .select('c.id')
      .first();
    if (!existing) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    await db('kanban_cards').where({ id: req.params.id }).delete();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
