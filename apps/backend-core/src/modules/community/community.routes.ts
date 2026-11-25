import { Router } from 'express';
import { CommunityController } from './community.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();
const communityController = new CommunityController();

// Leaderboard XP
router.get('/leaderboard', authenticate, communityController.getLeaderboard);

// Feed & Postingan
router.get('/', authenticate, communityController.getFeed);
router.post('/', authenticate, communityController.createPost);

// Interaksi (Like & Komentar)
router.post('/:id/like', authenticate, communityController.toggleLike);
router.get('/:id/comments', authenticate, communityController.getComments);
router.post('/:id/comments', authenticate, communityController.createComment);

// Rute untuk menghapus Post & Komentar
router.delete('/:id', authenticate, communityController.deletePost);
router.delete('/comments/:commentId', authenticate, communityController.deleteComment);

export default router;