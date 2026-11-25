import { Router } from 'express';
import { TradingController } from './trading.controller';

const router = Router();
const tradingController = new TradingController();

// Kita menggunakan POST karena ini adalah aksi mutasi data yang krusial
router.post('/buy', tradingController.buyAsset.bind(tradingController));
router.post('/sell', tradingController.sellAsset.bind(tradingController));

export default router;