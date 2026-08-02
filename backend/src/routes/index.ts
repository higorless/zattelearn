import { Router } from 'express';
import authRouter from './auth';
import subjectsRouter from './subjects';
import topicsRouter from './topics';
import objectivesRouter from './objectives';
import kanbanRouter from './kanban';
import studySessionsRouter from './studySessions';
import zettelNotesRouter from './zettelNotes';
import goalsRouter from './goals';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRouter);
router.use('/subjects', subjectsRouter);
router.use('/topics', topicsRouter);
router.use('/objectives', objectivesRouter);
router.use('/kanban', kanbanRouter);
router.use('/study-sessions', studySessionsRouter);
router.use('/zettel/notes', zettelNotesRouter);
router.use('/goals', goalsRouter);

export default router;
