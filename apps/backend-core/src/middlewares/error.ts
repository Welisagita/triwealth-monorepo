import { Request, Response, NextFunction } from 'express';

// Prisma error types tidak diekspor secara default dengan rapi, kita deteksi dari namanya
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    console.error("🚨 [Global Error]:", err.message);

    // Menangani error Prisma: Pelanggaran Unique Constraint (misal: email sudah terdaftar)
    if (err.name === 'PrismaClientKnownRequestError' && err.code === 'P2002') {
        const field = err.meta?.target?.[0] || 'Data';
        res.status(409).json({
            success: false,
            message: `${field} ini sudah digunakan, silakan gunakan yang lain.`
        });
        return;
    }

    // Menangani error umum lainnya
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Terjadi kesalahan internal pada server."
    });
};