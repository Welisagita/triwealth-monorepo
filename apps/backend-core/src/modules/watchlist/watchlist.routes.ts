import { Router } from 'express';
import { watchlistController } from './watchlist.controller';

const router = Router();

router.get('/:userId', watchlistController.getAll);
router.post('/', watchlistController.add);
router.delete('/:userId/:ticker', watchlistController.remove);

export default router;