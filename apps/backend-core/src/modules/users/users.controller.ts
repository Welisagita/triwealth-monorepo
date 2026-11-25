import { Request, Response, NextFunction } from 'express';
import { UserService } from './users.service';
import { AuthRequest } from '../../middlewares/auth'; 

const userService = new UserService();

export class UserController {
    
    // [GET] Dapatkan semua user
    getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await userService.getAllUsers(req.query);
            res.status(200).json({ success: true, data: result.data, meta: result.meta });
        } catch (error: any) {
            next(error);
        }
    }

    // [GET] Dapatkan semua admin (Hanya untuk SUPERADMIN)
    getAdmins = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const loggedInUser = req.user as any;
            if (loggedInUser.role !== 'SUPERADMIN') {
                res.status(403).json({ success: false, message: "Hanya Super Admin yang dapat melihat daftar Admin." });
                return;
            }
            const admins = await userService.getAllAdmins();
            res.status(200).json({ success: true, data: admins });
        } catch (error: any) {
            next(error);
        }
    }

    // [GET] Statistik Dashboard Admin
    getStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const stats = await userService.getDashboardStats();
            res.status(200).json({ success: true, data: stats });
        } catch (error: any) {
            next(error);
        }
    }

    // [GET] by ID
    getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const user = await userService.getUserProfile(id);
            res.status(200).json({ success: true, data: user });
        } catch (error: any) {
            next(error);
        }
    }

    // [POST] Create / Register
    create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Pass the requester's role to the service if they are logged in (for creating admins)
            const requesterRole = req.user ? (req.user as any).role : undefined;
            const newUser = await userService.createUser(req.body, requesterRole);
            res.status(201).json({ success: true, message: "User/Admin berhasil dibuat", data: newUser });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    // [POST] Login
    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await userService.login(req.body);
            res.status(200).json({ success: true, message: "Login berhasil", data });
        } catch (error: any) {
            let safeErrorMessage = "Gagal masuk. Terjadi kesalahan pada server kami.";
            if (error.message && error.message.length < 100 && !error.message.toLowerCase().includes('prisma')) {
                safeErrorMessage = error.message;
            }
            res.status(400).json({ success: false, message: safeErrorMessage });
        }
    }

    // [POST] Upload Dokumen KYC
    uploadKyc = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const loggedInUserId = (req.user as any).id;
            if (!req.file) {
                res.status(400).json({ success: false, message: "File dokumen wajib diunggah" });
                return;
            }
            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            const updatedUser = await userService.updateUser(loggedInUserId, { 
                kycDocumentUrl: fileUrl,
                kycStatus: "PENDING_VERIFICATION" 
            });
            res.status(200).json({ success: true, message: "Dokumen KYC berhasil diunggah", data: updatedUser });
        } catch (error: any) {
            next(error);
        }
    }

    // [PUT] Update (DIKUNCI: Admin bebas, User hanya diri sendiri)
    update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const loggedInUser = req.user as any; 

            // CEK OTORISASI: Jika BUKAN Admin/SuperAdmin dan mencoba ubah ID orang lain -> TOLAK
            if (!['ADMIN', 'SUPERADMIN'].includes(loggedInUser.role) && id !== loggedInUser.id) {
                res.status(403).json({ success: false, message: "Anda tidak memiliki izin mengubah profil ini" });
                return;
            }

            const updatedUser = await userService.updateUser(id, req.body);
            res.status(200).json({ success: true, message: "User berhasil diupdate", data: updatedUser });
        } catch (error: any) {
            next(error);
        }
    }

    // [DELETE] (DIKUNCI: Admin bebas, User hanya diri sendiri)
    delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const loggedInUser = req.user as any;

            // CEK OTORISASI: Jika BUKAN Admin/SuperAdmin dan mencoba hapus ID orang lain -> TOLAK
            if (!['ADMIN', 'SUPERADMIN'].includes(loggedInUser.role) && id !== loggedInUser.id) {
                res.status(403).json({ success: false, message: "Anda tidak memiliki izin menghapus profil ini" });
                return;
            }

            await userService.deleteUser(id);
            res.status(200).json({ success: true, message: "User berhasil dihapus" });
        } catch (error: any) {
            next(error);
        }
    }
}