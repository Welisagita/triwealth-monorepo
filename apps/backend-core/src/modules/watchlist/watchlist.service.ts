import { prisma } from '../../lib/prisma';

export class WatchlistService {
    // Ambil daftar favorit berdasarkan User ID
    async getByUser(userId: string) {
        return prisma.watchlist.findMany({ where: { userId } });
    }

    // Tambahkan ke favorit (Upsert/Abaikan jika sudah ada)
    async add(userId: string, ticker: string, name: string) {
        const existing = await prisma.watchlist.findUnique({
            where: { userId_ticker: { userId, ticker } }
        });
        if (existing) return existing;
        return prisma.watchlist.create({ data: { userId, ticker, name } });
    }

    // Hapus dari favorit
    async remove(userId: string, ticker: string) {
        return prisma.watchlist.deleteMany({ where: { userId, ticker } });
    }
}
export const watchlistService = new WatchlistService();