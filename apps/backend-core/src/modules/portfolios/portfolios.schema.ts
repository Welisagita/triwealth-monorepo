import { z } from 'zod';

// Aturan untuk membuat Portofolio baru (POST)
export const createPortfolioSchema = z.object({
    // userId sudah kita hapus dari sini karena akan diambil dari token otomatis
    // userId: z.string().uuid("Format ID User tidak valid"),
    name: z.string().min(3, "Nama portofolio minimal 3 karakter"),
    balance: z.number().min(0, "Saldo tidak boleh negatif")
});

// Aturan untuk mengubah Portofolio (PUT)
// .partial() otomatis membuat semua field di atas menjadi opsional!
export const updatePortfolioSchema = createPortfolioSchema.partial();

// Aturan validasi untuk Top-up saldo
export const topUpSchema = z.object({
    amount: z.number().min(10000, "Minimal top-up adalah Rp 10.000")
});