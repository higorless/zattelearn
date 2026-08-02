import { Router } from 'express';
import * as ctrl from '../controllers/zettelNotesController';

const router = Router();

router.get('/', ctrl.index);
router.get('/:id', ctrl.show);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.destroy);

export default router;
