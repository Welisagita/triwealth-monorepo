import { z } from 'zod';

export const createUserSchema = z.object({
    name: z.string().min(3, "Nama minimal harus 3 karakter"),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"), // Wajib ada password
    riskProfile: z.enum(["CONSERVATIVE", "MODERATE", "AGGRESSIVE"], {
        message: "Pilihan riskProfile hanya CONSERVATIVE, MODERATE, atau AGGRESSIVE"
    }).optional()
});

export const updateUserSchema = createUserSchema.partial().extend({
    kycStatus: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional()
});

// Aturan khusus untuk rute Login
export const loginSchema = z.object({
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(1, "Password wajib diisi")
});