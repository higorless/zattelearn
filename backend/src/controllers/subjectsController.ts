import { Request, Response, NextFunction } from 'express';
import db from '../db/knex';
import { createSubjectSchema, updateSubjectSchema } from '../schemas/subjects';

export async function index(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const subjects = await db('subjects').select('*').orderBy('created_at', 'desc');
    res.json(subjects);
  } catch (err) {
    next(err);
  }
}

export async function show(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const subject = await db('subjects').where({ id: req.params.id }).first();
    if (!subject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }
    res.json(subject);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createSubjectSchema.parse(req.body);
    const [subject] = await db('subjects').insert(data).returning('*');
    res.status(201).json(subject);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateSubjectSchema.parse(req.body);
    const [subject] = await db('subjects').where({ id: req.params.id }).update(data).returning('*');
    if (!subject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }
    res.json(subject);
  } catch (err) {
    next(err);
  }
}

export async function destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const count = await db('subjects').where({ id: req.params.id }).delete();
    if (!count) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
