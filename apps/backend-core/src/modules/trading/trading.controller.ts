import { Request, Response } from 'express';
import { TradingService } from './trading.service';

const tradingService = new TradingService();

export class TradingController {
  async buyAsset(req: Request, res: Response) {
    try {
      const { userId, ticker, name, assetType, amount, price } = req.body;
      const result = await tradingService.buy(userId, ticker, name, assetType, Number(amount), Number(price));
      res.status(200).json({ success: true, message: "Pembelian berhasil", data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async sellAsset(req: Request, res: Response) {
    try {
      const { userId, ticker, amount, price } = req.body;
      const result = await tradingService.sell(userId, ticker, Number(amount), Number(price));
      res.status(200).json({ success: true, message: "Penjualan berhasil", data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}