import { prisma } from '../../lib/prisma';
import { Portfolio, Prisma } from '@prisma/client';

export class PortfolioService {
    
    // [GET] Hanya ambil portofolio milik user yang sedang login
    async getAllPortfolios(userId: string): Promise<Portfolio[]> {
        return await prisma.portfolio.findMany({
            where: { userId }, // <-- Filter berdasarkan pemilik
            orderBy: { createdAt: 'desc' }
        });
    }

    // [GET] Kalkulasi Total Kekayaan
    async getTotalWealth(userId: string) {
        const result = await prisma.portfolio.aggregate({
            _sum: {
                balance: true
            },
            where: { 
                userId: userId,
                // Kita bisa menambahkan filter misal hanya yang aktif
                status: 'ACTIVE' 
            }
        });

        // Jika user belum punya portofolio, database akan mengembalikan null
        return result._sum.balance || 0;
    }

    // [POST]
    async createPortfolio(data: Prisma.PortfolioUncheckedCreateInput): Promise<Portfolio> {
        return await prisma.portfolio.create({ data });
    }

    // [PUT] Update portofolio (pastikan portofolio ini milik user tersebut)
    async updatePortfolio(id: string, userId: string, data: Prisma.PortfolioUpdateInput): Promise<Portfolio> {
        // Cek dulu apakah portofolio ada dan milik user yang login
        const existing = await prisma.portfolio.findFirst({ where: { id, userId } });
        if (!existing) throw new Error("Portofolio tidak ditemukan atau Anda tidak memiliki akses");

        return await prisma.portfolio.update({ where: { id }, data });
    }

    // [DELETE]
    async deletePortfolio(id: string, userId: string): Promise<Portfolio> {
        const existing = await prisma.portfolio.findFirst({ where: { id, userId } });
        if (!existing) throw new Error("Portofolio tidak ditemukan atau Anda tidak memiliki akses");

        return await prisma.portfolio.delete({ where: { id } });
    }

    // ... (fungsi existing biarkan saja) ...

    // [GET] Ambil data lengkap Portofolio, Posisi (Aset), dan Transaksi
    async getFullPortfolioData(userId: string) {
        // Cari portofolio utama (atau buat jika belum ada dengan modal 100 Juta)
        let portfolio = await prisma.portfolio.findFirst({ 
            where: { userId },
            orderBy: { createdAt: 'asc' } // Ambil yang pertama kali dibuat
        });

        if (!portfolio) {
            portfolio = await prisma.portfolio.create({
                data: { userId, name: "Main Portfolio", balance: 100000000 }
            });
        }

        const positions = await prisma.position.findMany({ 
            where: { userId } 
        });
        
        const transactions = await prisma.transaction.findMany({ 
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        return { portfolio, positions, transactions };
    }

    // [POST] Top-up saldo portofolio
    async topUpBalance(userId: string, amount: number) {
        const portfolio = await prisma.portfolio.findFirst({ 
            where: { userId },
            orderBy: { createdAt: 'asc' }
        });
        
        if (!portfolio) throw new Error("Portofolio tidak ditemukan. Silakan buka halaman Portofolio terlebih dahulu.");

        return await prisma.portfolio.update({
            where: { id: portfolio.id },
            data: { balance: portfolio.balance + amount }
        });
    }

    // [POST] Tarik saldo portofolio
    async withdrawBalance(userId: string, amount: number) {
        const portfolio = await prisma.portfolio.findFirst({ 
            where: { userId },
            orderBy: { createdAt: 'asc' }
        });
        
        if (!portfolio) throw new Error("Portofolio tidak ditemukan.");
        if (portfolio.balance < amount) throw new Error("Saldo kas tidak mencukupi untuk penarikan ini.");

        return await prisma.portfolio.update({
            where: { id: portfolio.id },
            data: { balance: portfolio.balance - amount }
        });
    }
} // <-- Penutup class PortfolioService
