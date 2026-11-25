import { Request, Response, NextFunction } from 'express';
import { EducationService } from './education.service';

const educationService = new EducationService();

export class EducationController {
    // [GET] Dapatkan semua materi
    getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // KUNCI UTAMA: Lempar req.query ke dalam service agar filter terbaca
            const result = await educationService.getAllContent(req.query);
            
            res.status(200).json({ 
                success: true, 
                data: result.data, 
                meta: result.meta 
            });
        } catch (error: any) {
            next(error);
        }
    }

    // [GET] Dapatkan materi berdasarkan ID
    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const material = await educationService.getEducationById(id);
            res.status(200).json({ success: true, data: material });
        } catch (error: any) {
            next(error);
        }
    }

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const content = await educationService.createContent(req.body);
            res.status(201).json({ success: true, message: "Materi berhasil dibuat", data: content });
        } catch (error: any) {
            next(error);
        }
    }

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const content = await educationService.updateContent(id, req.body);
            res.status(200).json({ success: true, message: "Materi berhasil diupdate", data: content });
        } catch (error: any) {
            next(error);
        }
    }

    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            await educationService.deleteContent(id);
            res.status(200).json({ success: true, message: "Materi berhasil dihapus" });
        } catch (error: any) {
            next(error);
        }
    }
}