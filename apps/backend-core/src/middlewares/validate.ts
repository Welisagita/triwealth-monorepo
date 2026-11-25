import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodTypeAny } from 'zod';

export const validate = (schema: ZodTypeAny) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            // Memeriksa apakah req.body sesuai dengan buku aturan (schema)
            schema.parse(req.body);
            next(); // Jika lolos, persilakan masuk ke Controller
        } catch (error) {
            // Jika tidak lolos, tangkap errornya menggunakan Zod v4 API (error.issues)
            if (error instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    message: "Validasi Data Gagal",
                    errors: error.issues.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
                return;
            }
            next(error);
        }
    };
};