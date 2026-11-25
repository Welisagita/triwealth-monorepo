import { Request, Response } from 'express';
import { watchlistService } from './watchlist.service';

export class WatchlistController {
    getAll = async (req: Request, res: Response) => {
        try {
            const data = await watchlistService.getByUser(req.params.userId);
            res.status(200).json({ success: true, data });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    add = async (req: Request, res: Response) => {
        try {
            const { userId, ticker, name } = req.body;
            const data = await watchlistService.add(userId, ticker, name);
            res.status(201).json({ success: true, data });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    remove = async (req: Request, res: Response) => {
        try {
            const { userId, ticker } = req.params;
            await watchlistService.remove(userId, ticker);
            res.status(200).json({ success: true, message: "Dihapus dari watchlist" });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
}
export const watchlistController = new WatchlistController();