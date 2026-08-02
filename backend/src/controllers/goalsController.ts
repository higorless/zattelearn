import { Request, Response, NextFunction } from 'express';
import db from '../db/knex';
import { createGoalSchema, updateGoalSchema } from '../schemas/goals';

// Returns goals with computed studied_seconds and joined subject/topic names
async function withProgress(query: ReturnType<typeof db>) {
  const rows = await query;
  const goalIds = rows.map((r: { id: number }) => r.id);
  if (goalIds.length === 0) return rows;

  // Sum study session durations for each goal's subject (and topic if set)
  const progress = await db('study_sessions as ss')
    .join('kanban_cards as kc', 'kc.id', 'ss.card_id')
    .join('goals as g', function () {
      this.on('g.subject_id', '=', 'kc.subject_id')
        .andOn(db.raw('(g.topic_id IS NULL OR g.topic_id = kc.topic_id)'))
    })
    .whereIn('g.id', goalIds)
    .whereNotNull('ss.ended_at')
    .whereNotNull('ss.duration_seconds')
    .groupBy('g.id')
    .select('g.id as goal_id', db.raw('SUM(ss.duration_seconds) as studied_seconds'));

  const progressMap = new Map(
    progress.map((p: { goal_id: number; studied_seconds: string }) => [
      p.goal_id,
      Number(p.studied_seconds),
    ])
  );

  return rows.map((r: { id: number; target_hours: string | number }) => ({
    ...r,
    target_hours: Number(r.target_hours),
    studied_seconds: progressMap.get(r.id) ?? 0,
  }));
}

export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = db('goals as g')
      .leftJoin('subjects as s', 's.id', 'g.subject_id')
      .leftJoin('topics as t', 't.id', 'g.topic_id')
      .select(
        'g.*',
        's.name as subject_name',
        's.color as subject_color',
        't.name as topic_name',
      )
      .orderBy('g.created_at', 'desc');

    res.json(await withProgress(query));
  } catch (err) {
    next(err);
  }
}

export async function show(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = db('goals as g')
      .leftJoin('subjects as s', 's.id', 'g.subject_id')
      .leftJoin('topics as t', 't.id', 'g.topic_id')
      .select(
        'g.*',
        's.name as subject_name',
        's.color as subject_color',
        't.name as topic_name',
      )
      .where('g.id', req.params.id);

    const results = await withProgress(query);
    if (!results.length) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }
    res.json(results[0]);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createGoalSchema.parse(req.body);
    const [goal] = await db('goals').insert(data).returning('*');
    res.status(201).json({ ...goal, studied_seconds: 0 });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateGoalSchema.parse(req.body);
    const [goal] = await db('goals').where({ id: req.params.id }).update(data).returning('*');
    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }
    res.json(goal);
  } catch (err) {
    next(err);
  }
}

export async function destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const count = await db('goals').where({ id: req.params.id }).delete();
    if (!count) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
