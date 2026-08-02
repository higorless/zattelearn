import { Router } from 'express';
import * as columnsCtrl from '../controllers/kanbanColumnsController';
import * as cardsCtrl from '../controllers/kanbanCardsController';

const router = Router();

router.get('/columns', columnsCtrl.index);
router.get('/columns/:id', columnsCtrl.show);
router.post('/columns', columnsCtrl.create);
router.put('/columns/:id', columnsCtrl.update);
router.delete('/columns/:id', columnsCtrl.destroy);

router.get('/cards', cardsCtrl.index);
router.get('/cards/:id', cardsCtrl.show);
router.post('/cards', cardsCtrl.create);
router.put('/cards/:id', cardsCtrl.update);
router.delete('/cards/:id', cardsCtrl.destroy);

export default router;
