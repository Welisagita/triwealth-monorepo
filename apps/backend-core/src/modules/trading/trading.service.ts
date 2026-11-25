import { prisma } from '../../lib/prisma';

export class TradingService {
  // Fungsi baru: Menarik kurs dari API Publik
  private async getLiveUSDRate(): Promise<number> {
    try {
      // Fetch bawaan Node.js (Node 18+)
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await response.json();
      return data.rates.IDR || 15500; // Fallback ke 15.500 jika tidak ada data IDR
    } catch (error) {
      console.error("Gagal mengambil kurs live, menggunakan fallback 15.500:", error);
      return 15500;
    }
  }

  // Helper kurs (Sekarang menggunakan async/await)
  private async getExchangeRate(assetType: string | undefined, ticker: string): Promise<number> {
    if (assetType === 'crypto' || assetType === 'us_stock' || ticker.includes('-USD') || (!ticker.includes('.JK') && ticker.length <= 5)) {
      return await this.getLiveUSDRate();
    }
    return 1; // Saham lokal / Reksadana
  }
  
  async buy(userId: string, ticker: string, name: string, assetType: string, amount: number, price: number) {
    const exchangeRate = await this.getExchangeRate(assetType, ticker);
    
    // Hitung total cost dalam mata uang asli (misal: USD)
    const totalCostInOriginalCurrency = amount * price;
    
    // Konversi ke IDR dan BULATKAN ke Rupiah terdekat agar tidak ada angka desimal yang bikin database crash
    const totalCostInIDR = Math.round(totalCostInOriginalCurrency * exchangeRate); 

    // PERBAIKAN: Pastikan selalu mengambil dompet UTAMA (yang paling pertama dibuat)
    let portfolio = await prisma.portfolio.findFirst({ 
        where: { userId },
        orderBy: { createdAt: 'asc' } // <--- TAMBAHAN KRUSIAL
    });
    
    if (!portfolio) {
      portfolio = await prisma.portfolio.create({ data: { userId, name: "Main Portfolio", balance: 100000000 } });
    }

    // Cek saldo menggunakan angka bulat
    if (portfolio.balance < totalCostInIDR) {
      throw new Error(`Saldo tidak mencukupi. Membutuhkan Rp ${totalCostInIDR.toLocaleString('id-ID')} untuk transaksi ini.`);
    }

    return await prisma.$transaction(async (tx) => {
      // Potong saldo dengan angka bulat
      const updatedPortfolio = await tx.portfolio.update({
        where: { id: portfolio!.id },
        data: { balance: { decrement: totalCostInIDR } } 
      });

      // Transaksi disimpan
      await tx.transaction.create({
        data: { userId, ticker, type: "BUY", amount, price, totalValue: totalCostInOriginalCurrency }
      });

      const existingPosition = await tx.position.findUnique({ where: { userId_ticker: { userId, ticker } } });

      if (existingPosition) {
        const newAmount = existingPosition.amount + amount;
        const newAvgPrice = ((existingPosition.amount * existingPosition.averagePrice) + totalCostInOriginalCurrency) / newAmount;
        return await tx.position.update({ where: { id: existingPosition.id }, data: { amount: newAmount, averagePrice: newAvgPrice } });
      } else {
        return await tx.position.create({ data: { userId, ticker, name, assetType, amount, averagePrice: price } });
      }
    });
  }

  async sell(userId: string, ticker: string, amount: number, price: number) {
    // PERBAIKAN: Pastikan selalu mengambil dompet UTAMA
    const portfolio = await prisma.portfolio.findFirst({ 
        where: { userId },
        orderBy: { createdAt: 'asc' } // <--- TAMBAHAN KRUSIAL
    });
    
    if (!portfolio) throw new Error("Portofolio tidak ditemukan.");

    const position = await prisma.position.findUnique({ where: { userId_ticker: { userId, ticker } } });
    if (!position || position.amount < amount) throw new Error("Jumlah aset tidak mencukupi untuk dijual.");

    // PERHATIKAN: Pastikan getExchangeRate menggunakan 'await' jika Anda sudah mengubahnya menjadi fungsi async
    const exchangeRate = await this.getExchangeRate(position.assetType, ticker);
    const totalRevenueOriginal = amount * price;
    
    // BULATKAN PENDAPATAN
    const totalRevenueIDR = Math.round(totalRevenueOriginal * exchangeRate);

    return await prisma.$transaction(async (tx) => {
      // PERBAIKAN KRUSIAL: Tambah saldo dengan operasi 'increment' dari database
      await tx.portfolio.update({
        where: { id: portfolio.id },
        data: { balance: { increment: totalRevenueIDR } } 
      });

      // Catat transaksi jual
      await tx.transaction.create({
        data: { userId, ticker, type: "SELL", amount, price, totalValue: totalRevenueOriginal }
      });

      // Kurangi jumlah kepemilikan aset, atau hapus posisinya jika sudah habis
      const newAmount = position.amount - amount;
      if (newAmount === 0) {
        return await tx.position.delete({ where: { id: position.id } });
      } else {
        return await tx.position.update({ where: { id: position.id }, data: { amount: newAmount } });
      }
    });
  }
}