import { Request, Response, NextFunction } from 'express';
import db from '../db/knex';
import { createZettelNoteSchema, updateZettelNoteSchema } from '../schemas/zettelNotes';

export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = db('zettel_notes').select('*').orderBy('created_at', 'desc');
    if (req.query.session_id) {
      query.where({ session_id: req.query.session_id });
    }
    res.json(await query);
  } catch (err) {
    next(err);
  }
}

export async function show(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const note = await db('zettel_notes').where({ id: req.params.id }).first();
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
    const data = createZettelNoteSchema.parse(req.body);
    const [note] = await db('zettel_notes').insert(data).returning('*');
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateZettelNoteSchema.parse(req.body);
    const [note] = await db('zettel_notes').where({ id: req.params.id }).update(data).returning('*');
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
    const count = await db('zettel_notes').where({ id: req.params.id }).delete();
    if (!count) {
      res.status(404).json({ error: 'Zettel note not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
