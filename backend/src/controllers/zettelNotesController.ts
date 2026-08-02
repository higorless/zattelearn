import { Request, Response, NextFunction } from 'express';
import db from '../db/knex';
import { createZettelNoteSchema, updateZettelNoteSchema } from '../schemas/zettelNotes';
import { AuthRequest } from '../middleware/authenticate';

export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const query = db('zettel_notes').select('*').where({ user_id: userId }).orderBy('created_at', 'desc');
    if (req.query.session_id) query.where({ session_id: req.query.session_id });
    res.json(await query);
  } catch (err) {
    next(err);
  }
}

export async function show(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const note = await db('zettel_notes').where({ id: req.params.id, user_id: userId }).first();
    if (!note) {
      res.status(404).json({ error: 'Zettel note not found' });
      return;
    }
    res.json(note);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const data = createZettelNoteSchema.parse(req.body);
    const [note] = await db('zettel_notes').insert({ ...data, user_id: userId }).returning('*');
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const data = updateZettelNoteSchema.parse(req.body);
    const [note] = await db('zettel_notes').where({ id: req.params.id, user_id: userId }).update(data).returning('*');
    if (!note) {
      res.status(404).json({ error: 'Zettel note not found' });
      return;
    }
    res.json(note);
  } catch (err) {
    next(err);
  }
}

export async function destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const count = await db('zettel_notes').where({ id: req.params.id, user_id: userId }).delete();
    if (!count) {
      res.status(404).json({ error: 'Zettel note not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
