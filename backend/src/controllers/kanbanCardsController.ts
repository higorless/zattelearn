import { Request, Response, NextFunction } from 'express';
import db from '../db/knex';
import { createKanbanCardSchema, updateKanbanCardSchema } from '../schemas/kanbanCards';

export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = db('kanban_cards').select('*').orderBy('position', 'asc');
    if (req.query.column_id) {
      query.where({ column_id: req.query.column_id });
    }
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
    const card = await db('kanban_cards as c')
      .leftJoin('subjects as s', 'c.subject_id', 's.id')
      .leftJoin('topics as t', 'c.topic_id', 't.id')
      .select(
        'c.*',
        db.raw(`CASE WHEN s.id IS NOT NULL THEN json_build_object('id', s.id, 'name', s.name, 'color', s.color) ELSE NULL END as subject`),
        db.raw(`CASE WHEN t.id IS NOT NULL THEN json_build_object('id', t.id, 'name', t.name) ELSE NULL END as topic`),
      )
      .where('c.id', req.params.id)
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
    const data = createKanbanCardSchema.parse(req.body);

    if (data.position === undefined) {
      const [{ max }] = await db('kanban_cards')
        .where({ column_id: data.column_id })
        .max('position as max');
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
    const data = updateKanbanCardSchema.parse(req.body);
    const [card] = await db('kanban_cards').where({ id: req.params.id }).update(data).returning('*');
    if (!card) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }
    res.json(card);
  } catch (err) {
    next(err);
  }
}

export async function destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const count = await db('kanban_cards').where({ id: req.params.id }).delete();
    if (!count) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
