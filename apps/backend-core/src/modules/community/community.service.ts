import { prisma } from '../../lib/prisma';

export class CommunityService {
    // [GET] Mengambil Feed Postingan (Dengan Filter Tag & Paginasi)
    async getFeed(currentUserId: string, queryParams: any) {
        const page = parseInt(queryParams.page as string) || 1;
        const limit = parseInt(queryParams.limit as string) || 10;
        const skip = (page - 1) * limit;

        const filter: any = {};
        
        // Filter berdasarkan Lingkaran Profil Risiko (Konservatif/Moderat/Agresif)
        if (queryParams.circle && queryParams.circle !== 'ALL') {
            filter.user = { riskProfile: queryParams.circle.toUpperCase() };
        }

        // Filter berdasarkan Cashtag ($BMRI, dll)
        if (queryParams.tag) {
            filter.content = { contains: queryParams.tag, mode: 'insensitive' };
        }

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where: filter,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { id: true, name: true, role: true, riskProfile: true }
                    },
                    _count: {
                        select: { comments: true, likes: true }
                    },
                    // Cek apakah user yang sedang login sudah me-like post ini
                    likes: {
                        where: { userId: currentUserId },
                        select: { id: true }
                    }
                }
            }),
            prisma.post.count({ where: filter })
        ]);

        // Transformasi data agar Frontend mudah membacanya
        const transformedPosts = posts.map(post => {
            const { likes, _count, ...rest } = post;
            return {
                ...rest,
                likesCount: _count.likes,
                commentsCount: _count.comments,
                isLikedByMe: likes.length > 0 // true jika user sudah like
            };
        });

        return {
            data: transformedPosts,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }

    // [POST] Membuat Postingan Baru
    async createPost(userId: string, content: string) {
        const extractedTags = content.match(/\$[A-Za-z0-9]+/g) || [];
        const uniqueTags = [...new Set(extractedTags)].map(tag => tag.toUpperCase());

        return await prisma.post.create({
            data: {
                userId,
                content,
                tags: uniqueTags
            },
            include: {
                user: { select: { id: true, name: true, role: true, riskProfile: true } }
            }
        });
    }

    // [POST] Toggle Like
    async toggleLike(userId: string, postId: string) {
        const existingLike = await prisma.like.findUnique({
            where: { userId_postId: { userId, postId } }
        });

        if (existingLike) {
            await prisma.like.delete({ where: { id: existingLike.id } });
            return { message: 'Unliked', isLiked: false };
        } else {
            await prisma.like.create({ data: { userId, postId } });
            return { message: 'Liked', isLiked: true };
        }
    }

    // [POST] Tambah Komentar
    async createComment(userId: string, postId: string, content: string) {
        return await prisma.comment.create({
            data: { userId, postId, content },
            include: {
                user: { select: { name: true, role: true } }
            }
        });
    }

    // [GET] Ambil Komentar dari sebuah Post
    async getComments(postId: string) {
        return await prisma.comment.findMany({
            where: { postId },
            orderBy: { createdAt: 'asc' },
            include: {
                user: { select: { id: true, name: true, role: true } }
            }
        });
    }

    // [GET] Leaderboard XP (Top 10 User)
    async getLeaderboard() {
        return await prisma.user.findMany({
            where: { role: 'USER' }, 
            orderBy: { xp: 'desc' },
            take: 10,
            select: { id: true, name: true, riskProfile: true, xp: true }
        });
    }

    // [DELETE] Hapus Postingan
    async deletePost(postId: string, userId: string, role: string) {
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return { error: "NOT_FOUND" };
        
        // Tolak jika bukan pemilik dan bukan ADMIN/SUPERADMIN
        if (post.userId !== userId && role === 'USER') return { error: "FORBIDDEN" };
        
        // BUNGKUS DALAM TRANSAKSI: Hapus Like & Komentar dulu, baru hapus Post-nya
        await prisma.$transaction([
            prisma.like.deleteMany({ where: { postId } }),
            prisma.comment.deleteMany({ where: { postId } }),
            prisma.post.delete({ where: { id: postId } })
        ]);

        return { success: true };
    }

    // [DELETE] Hapus Komentar (Baru)
    async deleteComment(commentId: string, userId: string, role: string) {
        const comment = await prisma.comment.findUnique({ where: { id: commentId } });
        if (!comment) return { error: "NOT_FOUND" };
        
        // Tolak jika bukan pemilik dan bukan ADMIN/SUPERADMIN
        if (comment.userId !== userId && role === 'USER') return { error: "FORBIDDEN" };
        
        await prisma.comment.delete({ where: { id: commentId } });
        return { success: true };
    }
}