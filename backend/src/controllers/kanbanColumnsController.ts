import { Request, Response, NextFunction } from 'express';
import db from '../db/knex';
import { createKanbanColumnSchema, updateKanbanColumnSchema } from '../schemas/kanbanColumns';
import { AuthRequest } from '../middleware/authenticate';

export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;

    const columns = await db('kanban_columns')
      .select('*')
      .where({ user_id: userId })
      .orderBy('position', 'asc');

    const cards = await db('kanban_cards as c')
      .join('kanban_columns as col', 'c.column_id', 'col.id')
      .leftJoin('subjects as s', 'c.subject_id', 's.id')
      .leftJoin('topics as t', 'c.topic_id', 't.id')
      .leftJoin('objectives as o', 'c.objective_id', 'o.id')
      .where('col.user_id', userId)
      .select(
        'c.*',
        db.raw(`CASE WHEN s.id IS NOT NULL THEN json_build_object('id', s.id, 'name', s.name, 'color', s.color) ELSE NULL END as subject`),
        db.raw(`CASE WHEN t.id IS NOT NULL THEN json_build_object('id', t.id, 'name', t.name) ELSE NULL END as topic`),
        db.raw(`CASE WHEN o.id IS NOT NULL THEN json_build_object('id', o.id, 'title', o.title, 'status', o.status) ELSE NULL END as objective`),
      )
      .orderBy('c.position', 'asc');

    const cardsByColumn = cards.reduce<Record<number, typeof cards>>((acc, card) => {
      if (!acc[card.column_id]) acc[card.column_id] = [];
      acc[card.column_id].push(card);
      return acc;
    }, {});

    res.json(columns.map(col => ({ ...col, cards: cardsByColumn[col.id] ?? [] })));
  } catch (err) {
    next(err);
  }
}

export async function show(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const column = await db('kanban_columns').where({ id: req.params.id, user_id: userId }).first();
    if (!column) {
      res.status(404).json({ error: 'Column not found' });
      return;
    }
    res.json(column);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const data = createKanbanColumnSchema.parse(req.body);

    if (data.position === undefined) {
      const [{ max }] = await db('kanban_columns').where({ user_id: userId }).max('position as max');
      data.position = (max ?? -1) + 1;
    }

    const [column] = await db('kanban_columns').insert({ ...data, user_id: userId }).returning('*');
    res.status(201).json(column);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const data = updateKanbanColumnSchema.parse(req.body);
    const [column] = await db('kanban_columns')
      .where({ id: req.params.id, user_id: userId })
      .update(data)
      .returning('*');
    if (!column) {
      res.status(404).json({ error: 'Column not found' });
      return;
    }
    res.json(column);
  } catch (err) {
    next(err);
  }
}

export async function destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const count = await db('kanban_columns').where({ id: req.params.id, user_id: userId }).delete();
    if (!count) {
      res.status(404).json({ error: 'Column not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
