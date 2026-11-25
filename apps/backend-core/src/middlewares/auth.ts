import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_rahasia_triwealth_2026';

// Kita membuat tipe baru yang memperluas Request bawaan Express agar bisa menyimpan data user
export interface AuthRequest extends Request {
    user?: string | jwt.JwtPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    // 1. Ambil header Authorization dari request
    const authHeader = req.headers.authorization;

    // 2. Cek apakah token ada dan formatnya benar ("Bearer <token>")
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: "Akses ditolak. Token tidak ditemukan atau format salah." });
        return;
    }

    // 3. Ekstrak token aslinya saja (buang kata "Bearer ")
    const token = authHeader.split(' ')[1];

    try {
        // 4. Verifikasi keaslian token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 5. Jika asli, simpan isi tiket (id & email) ke dalam req.user
        req.user = decoded; 
        
        // 6. Persilakan masuk ke Controller
        next(); 
    } catch (error) {
        res.status(403).json({ success: false, message: "Token tidak valid atau sudah kedaluwarsa." });
    }
};