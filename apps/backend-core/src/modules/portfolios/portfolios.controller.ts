import { Response, NextFunction } from 'express';
import { PortfolioService } from './portfolios.service';
import { AuthRequest } from '../../middlewares/auth'; // Import tipe request khusus kita

const portfolioService = new PortfolioService();

export class PortfolioController {
    
    getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req.user as any).id; // Ambil ID dari token JWT
            const portfolios = await portfolioService.getAllPortfolios(userId);
            res.status(200).json({ success: true, data: portfolios });
        } catch (error: any) {
            next(error);
        }
    }

    // [GET] Endpoint Total Kekayaan
    getWealthSummary = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req.user as any).id;
            const totalWealth = await portfolioService.getTotalWealth(userId);

            res.status(200).json({
                success: true,
                message: "Kalkulasi total kekayaan berhasil ditarik",
                data: {
                    totalWealth: totalWealth,
                    currency: "IDR"
                }
            });
        } catch (error: any) {
            next(error);
        }
    }

    create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req.user as any).id; // Ambil ID dari token JWT
            
            // Gabungkan data input (name, balance) dengan userId otomatis
            const portfolioData = { ...req.body, userId };
            
            const portfolio = await portfolioService.createPortfolio(portfolioData);
            res.status(201).json({ success: true, message: "Portofolio berhasil dibuat", data: portfolio });
        } catch (error: any) {
            next(error);
        }
    }

    update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const userId = (req.user as any).id;
            
            const portfolio = await portfolioService.updatePortfolio(id, userId, req.body);
            res.status(200).json({ success: true, message: "Portofolio berhasil diupdate", data: portfolio });
        } catch (error: any) {
            next(error);
        }
    }

    delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const userId = (req.user as any).id;
            
            await portfolioService.deletePortfolio(id, userId);
            res.status(200).json({ success: true, message: "Portofolio berhasil dihapus" });
        } catch (error: any) {
            next(error);
        }
    }

    // ... (fungsi existing getAll, getWealthSummary, create, update, delete biarkan saja) ...

    // Endpoint Baru: Ambil Portofolio Lengkap untuk Halaman Trading
    getFullData = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req.user as any).id;
            const data = await portfolioService.getFullPortfolioData(userId);
            res.status(200).json({ success: true, data });
        } catch (error: any) {
            next(error);
        }
    }

    // Endpoint Baru: Top Up Saldo
    topUp = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req.user as any).id;
            const { amount } = req.body;
            
            await portfolioService.topUpBalance(userId, Number(amount));
            res.status(200).json({ success: true, message: "Top-up saldo simulasi berhasil" });
        } catch (error: any) {
            next(error);
        }
    }

    // Endpoint Baru: Tarik Dana
    withdraw = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req.user as any).id;
            const { amount } = req.body;
            
            await portfolioService.withdrawBalance(userId, Number(amount));
            res.status(200).json({ success: true, message: "Penarikan dana simulasi berhasil" });
        } catch (error: any) {
            next(error);
        }
    }
} // <-- Penutup class PortfolioController
