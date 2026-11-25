import 'dotenv/config'; // Wajib agar process.env terbaca
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Ambil URL koneksi dari file .env
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL tidak ditemukan di file .env!");
}

// Inisialisasi adapter PostgreSQL
const adapter = new PrismaPg({ connectionString });

// Inject adapter ke dalam Prisma Client
export const prisma = new PrismaClient({ adapter });