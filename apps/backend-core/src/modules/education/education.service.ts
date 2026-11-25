import { prisma } from '../../lib/prisma';
import { Education } from '@prisma/client';

export class EducationService {
    // [GET] Mengambil semua materi (dengan Filter Lanjutan & Pagination)
    async getAllContent(queryParams: any = {}) {
        const page = parseInt(queryParams.page as string) || 1;
        const limit = parseInt(queryParams.limit as string) || 10;
        const skip = (page - 1) * limit;

        const filter: any = {};
        const andConditions: any[] = [];

        // 1. Pencarian berdasarkan Judul atau Nama Penulis
        if (queryParams.search) {
            andConditions.push({
                OR: [
                    { title: { contains: queryParams.search as string, mode: 'insensitive' } },
                    { authorName: { contains: queryParams.search as string, mode: 'insensitive' } }
                ]
            });
        }

        // 2. Filter Tipe Modul
        if (queryParams.type) {
            andConditions.push({ type: queryParams.type });
        }

        // 3. Filter Rentang Tanggal (Mendukung data baru dan data lama yang belum punya publishedAt)
        if (queryParams.startDate || queryParams.endDate) {
            const dateRange: any = {};
            if (queryParams.startDate) {
                dateRange.gte = new Date(`${queryParams.startDate}T00:00:00.000Z`);
            }
            if (queryParams.endDate) {
                dateRange.lte = new Date(`${queryParams.endDate}T23:59:59.999Z`);
            }

            // Cari di publishedAt, JIKA KOSONG (data lama) cari di createdAt
            andConditions.push({
                OR: [
                    { publishedAt: dateRange },
                    { publishedAt: null, createdAt: dateRange }
                ]
            });
        }

        // Gabungkan semua kondisi ke dalam array AND agar tidak saling menimpa
        if (andConditions.length > 0) {
            filter.AND = andConditions;
        }

        const [data, total] = await Promise.all([
            prisma.education.findMany({
                where: filter,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' } // Gunakan createdAt agar urutan data lama & baru konsisten
            }),
            prisma.education.count({ where: filter })
        ]);

        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }

    // [GET] Mengambil SATU materi edukasi berdasarkan ID
    async getEducationById(id: string) {
        const material = await prisma.education.findUnique({
            where: { id }
        });
        
        if (!material) {
            const error: any = new Error("Materi edukasi tidak ditemukan");
            error.statusCode = 404;
            throw error;
        }
        
        return material;
    }

    // CREATE
    async createContent(data: any): Promise<Education> {
        return await prisma.education.create({ data });
    }

    // UPDATE
    async updateContent(id: string, data: any): Promise<Education> {
        return await prisma.education.update({
            where: { id },
            data
        });
    }

    // DELETE
    async deleteContent(id: string): Promise<Education> {
        return await prisma.education.delete({
            where: { id }
        });
    }
}