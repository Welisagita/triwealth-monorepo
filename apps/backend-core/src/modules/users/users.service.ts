import { prisma } from '../../lib/prisma';
import { User, Prisma, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_rahasia_triwealth_2026';

export class UserService {
    
    // [GET] Mengambil semua user (kecuali ADMIN & SUPERADMIN)
    async getAllUsers(queryParams: any) {
        const page = parseInt(queryParams.page as string) || 1;
        const limit = parseInt(queryParams.limit as string) || 10;
        const skip = (page - 1) * limit;

        const filter: any = {
            role: 'USER' 
        };

        if (queryParams.search) {
            const searchStr = queryParams.search as string;
            const upperSearch = searchStr.toUpperCase();
            
            const orConditions: any[] = [
                { name: { contains: searchStr, mode: 'insensitive' } },
                { email: { contains: searchStr, mode: 'insensitive' } }
            ];

            if (['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'].includes(upperSearch)) {
                orConditions.push({ riskProfile: upperSearch });
            }

            filter.OR = orConditions;
        }

        if (queryParams.status) {
            filter.kycStatus = queryParams.status;
        }
        
        if (queryParams.startDate || queryParams.endDate) {
            filter.createdAt = {};
            if (queryParams.startDate) {
                filter.createdAt.gte = new Date(`${queryParams.startDate}T00:00:00.000Z`);
            }
            if (queryParams.endDate) {
                filter.createdAt.lte = new Date(`${queryParams.endDate}T23:59:59.999Z`);
            }
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: filter,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    kycStatus: true,
                    riskProfile: true,
                    createdAt: true,
                    portfolios: {
                        where: { status: 'ACTIVE' },
                        select: { balance: true }
                    }
                }
            }),
            prisma.user.count({ where: filter })
        ]);

        const transformedUsers = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            kycStatus: user.kycStatus,
            riskProfile: user.riskProfile,
            createdAt: user.createdAt,
            totalBalance: user.portfolios.reduce((sum, p) => sum + (p.balance || 0), 0)
        }));

        return {
            data: transformedUsers,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }

    // [GET] Mengambil semua ADMIN dan SUPERADMIN
    async getAllAdmins() {
        return await prisma.user.findMany({
            where: {
                role: { in: ['ADMIN', 'SUPERADMIN'] }
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // [GET] Mengambil satu user
    async getUserProfile(id: string) {
        const user = await prisma.user.findUnique({ 
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                kycDocumentUrl: true,
                kycStatus: true,
                riskProfile: true,
                adminNote: true, 
                role: true, 
                createdAt: true,
                updatedAt: true,
                portfolios: {
                    where: { status: 'ACTIVE' },
                    orderBy: { createdAt: 'asc' }, 
                    take: 1, 
                    select: { balance: true }
                },
                positions: {
                    where: { amount: { gt: 0 } },
                    orderBy: { updatedAt: 'desc' },
                    select: { ticker: true, name: true, amount: true, averagePrice: true }
                },
                transactions: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: { ticker: true, type: true, amount: true, totalValue: true, createdAt: true }
                }
            }
        });
        
        if (!user) throw new Error(`User dengan ID ${id} tidak ditemukan.`);
        return user;
    }

    // [POST] Membuat user (atau ADMIN jika request dari SUPERADMIN)
    async createUser(data: Prisma.UserCreateInput, requesterRole?: Role): Promise<User> {
        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) throw new Error("Email sudah digunakan!");

        // Validasi: Hanya SUPERADMIN yang bisa membuat ADMIN/SUPERADMIN
        if (data.role && (data.role === 'ADMIN' || data.role === 'SUPERADMIN')) {
            if (requesterRole !== 'SUPERADMIN') {
                throw new Error("Hanya SUPERADMIN yang dapat membuat akun Admin.");
            }
        }

        const hashedPassword = await bcrypt.hash(data.password as string, 10);

        return await prisma.user.create({
            data: {
                ...data,
                password: hashedPassword
            }
        });
    }

    // [POST] Fitur Login
    async login(data: any) {
        const user = await prisma.user.findUnique({ where: { email: data.email } });
        
        if (!user || !(await bcrypt.compare(data.password, user.password))) {
            const error: any = new Error("Email atau password salah");
            error.statusCode = 401; 
            throw error;
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '1d' }
        );

        const { password, ...userTanpaPassword } = user;
        return { user: userTanpaPassword, token };
    }

    // [PUT/PATCH] Memperbarui data user
    async updateUser(id: string, data: Prisma.UserUpdateInput) {
        await this.getUserProfile(id); 

        if (data.password) {
            data.password = await bcrypt.hash(data.password as string, 10);
        }

        return await prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                kycDocumentUrl: true,
                kycStatus: true,
                riskProfile: true,
                adminNote: true, 
                role: true, 
                createdAt: true,
                updatedAt: true
            }
        });
    }
    
    // [DELETE] Menghapus user
    async deleteUser(id: string): Promise<User> {
        const user = await prisma.user.delete({
            where: { id }
        });
        return user;
    }

    // [GET] Statistik Dashboard Admin
    async getDashboardStats() {
        const [totalUsers, totalEducation, kycPending, totalPortfolioValue, recentTransactions] = await Promise.all([
            prisma.user.count({ where: { role: 'USER' } }),
            prisma.education.count(),
            prisma.user.count({ where: { role: 'USER', kycStatus: { in: ['PENDING', 'PENDING_VERIFICATION'] } } }),
            prisma.portfolio.aggregate({ _sum: { balance: true } }),
            prisma.transaction.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true } } }
            })
        ]);

        return {
            totalUsers,
            totalEducation,
            kycPending,
            totalAum: totalPortfolioValue._sum.balance || 0,
            recentTransactions: recentTransactions.map(tx => ({
                id: tx.id,
                userName: tx.user.name,
                type: tx.type,
                ticker: tx.ticker,
                totalValue: tx.totalValue,
                createdAt: tx.createdAt
            }))
        };
    }
}