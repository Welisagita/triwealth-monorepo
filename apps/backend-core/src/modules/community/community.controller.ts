import { Request, Response, NextFunction } from 'express';
import { CommunityService } from './community.service';
import { AuthRequest } from '../../middlewares/auth'; 

const communityService = new CommunityService();

export class CommunityController {
    
    getFeed = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const currentUserId = (req.user as any).id;
            const result = await communityService.getFeed(currentUserId, req.query);
            res.status(200).json({ success: true, data: result.data, meta: result.meta });
        } catch (error: any) {
            next(error);
        }
    }

    createPost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req.user as any).id;
            const { content } = req.body;
            if (!content || content.trim() === '') {
                res.status(400).json({ success: false, message: "Konten tidak boleh kosong" });
                return;
            }
            const newPost = await communityService.createPost(userId, content);
            res.status(201).json({ success: true, message: "Post berhasil dibuat", data: newPost });
        } catch (error: any) {
            next(error);
        }
    }

    toggleLike = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req.user as any).id;
            const postId = req.params.id;
            const result = await communityService.toggleLike(userId, postId);
            res.status(200).json({ success: true, ...result });
        } catch (error: any) {
            next(error);
        }
    }

    createComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req.user as any).id;
            const postId = req.params.id;
            const { content } = req.body;
            if (!content || content.trim() === '') {
                res.status(400).json({ success: false, message: "Komentar tidak boleh kosong" });
                return;
            }
            const comment = await communityService.createComment(userId, postId, content);
            res.status(201).json({ success: true, data: comment });
        } catch (error: any) {
            next(error);
        }
    }

    getComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const postId = req.params.id;
            const comments = await communityService.getComments(postId);
            res.status(200).json({ success: true, data: comments });
        } catch (error: any) {
            next(error);
        }
    }

    getLeaderboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const leaderboard = await communityService.getLeaderboard();
            res.status(200).json({ success: true, data: leaderboard });
        } catch (error: any) {
            next(error);
        }
    }

    // --- FUNGSI BARU: DELETE POST & COMMENT ---

    deletePost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req.user as any).id;
            const role = (req.user as any).role;
            const postId = req.params.id;

            const result = await communityService.deletePost(postId, userId, role);
            
            if (result.error === "NOT_FOUND") {
                res.status(404).json({ success: false, message: "Post tidak ditemukan" });
                return;
            }
            if (result.error === "FORBIDDEN") {
                res.status(403).json({ success: false, message: "Akses ditolak" });
                return;
            }

            res.status(200).json({ success: true, message: "Post dihapus" });
        } catch (error: any) {
            next(error);
        }
    }

    deleteComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req.user as any).id;
            const role = (req.user as any).role;
            const commentId = req.params.commentId;

            const result = await communityService.deleteComment(commentId, userId, role);
            
            if (result.error === "NOT_FOUND") {
                res.status(404).json({ success: false, message: "Komentar tidak ditemukan" });
                return;
            }
            if (result.error === "FORBIDDEN") {
                res.status(403).json({ success: false, message: "Akses ditolak" });
                return;
            }

            res.status(200).json({ success: true, message: "Komentar dihapus" });
        } catch (error: any) {
            next(error);
        }
    }
}