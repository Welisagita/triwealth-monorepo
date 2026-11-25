import { z } from 'zod';

export const createEducationSchema = z.object({
    title: z.string().min(5, "Judul materi minimal 5 karakter"),
    content: z.string().min(10, "Konten terlalu pendek"),
    type: z.enum(["ARTICLE", "VIDEO", "QUIZ"], { 
        message: "Pilihan type hanya ARTICLE, VIDEO, atau QUIZ" 
    }),
    xpReward: z.number().min(0, "XP Reward harus berupa angka positif"),
    authorName: z.string().optional(),
    publishedAt: z.string().optional() // Menerima format tanggal ISO dari frontend
});

export const updateEducationSchema = createEducationSchema.partial();