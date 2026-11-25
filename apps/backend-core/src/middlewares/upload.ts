import multer from 'multer';
import path from 'path';
import fs from 'fs'; // Import pustaka File System

// Cek dan buat folder otomatis jika belum ada
const uploadDir = 'public/uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'kyc-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Format file ditolak. Hanya JPG, PNG, atau PDF."));
    }
};

export const uploadKycMiddleware = multer({ 
    storage, 
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter 
});