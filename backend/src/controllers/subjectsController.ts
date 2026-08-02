import { Request, Response, NextFunction } from 'express';
import db from '../db/knex';
import { createSubjectSchema, updateSubjectSchema } from '../schemas/subjects';
import { AuthRequest } from '../middleware/authenticate';

export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const subjects = await db('subjects').select('*').where({ user_id: userId }).orderBy('created_at', 'desc');
    res.json(subjects);
  } catch (err) {
    next(err);
  }
}

export async function show(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const subject = await db('subjects').where({ id: req.params.id, user_id: userId }).first();
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
    const userId = (req as AuthRequest).userId;
    const data = createSubjectSchema.parse(req.body);
    const [subject] = await db('subjects').insert({ ...data, user_id: userId }).returning('*');
    res.status(201).json(subject);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const data = updateSubjectSchema.parse(req.body);
    const [subject] = await db('subjects').where({ id: req.params.id, user_id: userId }).update(data).returning('*');
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
    const userId = (req as AuthRequest).userId;
    const count = await db('subjects').where({ id: req.params.id, user_id: userId }).delete();
    if (!count) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
