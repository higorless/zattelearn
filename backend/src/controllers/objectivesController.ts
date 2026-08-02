import { Request, Response, NextFunction } from 'express';
import db from '../db/knex';
import { createObjectiveSchema, updateObjectiveSchema } from '../schemas/objectives';

export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = db('objectives').select('*').orderBy('created_at', 'desc');
    if (req.query.subject_id) {
      query.where({ subject_id: req.query.subject_id });
    }
    if (req.query.status) {
      query.where({ status: req.query.status });
    }
    res.json(await query);
  } catch (err) {
    next(err);
  }
}

export async function show(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const objective = await db('objectives').where({ id: req.params.id }).first();
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
    const data = createObjectiveSchema.parse(req.body);
    const [objective] = await db('objectives').insert(data).returning('*');
    res.status(201).json(objective);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateObjectiveSchema.parse(req.body);
    const [objective] = await db('objectives').where({ id: req.params.id }).update(data).returning('*');
    if (!objective) {
      res.status(404).json({ error: 'Objective not found' });
      return;
    }
    res.json(objective);
  } catch (err) {
    next(err);
  }
}

export async function destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const count = await db('objectives').where({ id: req.params.id }).delete();
    if (!count) {
      res.status(404).json({ error: 'Objective not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
