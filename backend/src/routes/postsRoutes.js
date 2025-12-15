import express from 'express';
import { postController } from '../controllers/postController.js';
import { isAuth } from '../middlewares/authMiddleware.js';
import { uploadPostImages } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', postController.getPosts);
router.get('/stats/top-posters', postController.getTopPosters); // Public - không cần đăng nhập
router.get('/:id', postController.getPostById);
// Like/unlike
router.post('/:id/like', isAuth, postController.toggleLike);

// Protected routes (require authentication)
router.post('/', isAuth, uploadPostImages, postController.createPost);
router.post('/share', isAuth, postController.sharePost); // Chia sẻ bài đăng
router.put('/:id', isAuth, uploadPostImages, postController.updatePost);
router.delete('/:id', isAuth, postController.deletePost);

// Admin routes
router.patch('/:id/approve', isAuth, postController.approvePost);
router.patch('/:id/reject', isAuth, postController.rejectPost);
router.patch('/:id/mark-found', isAuth, postController.markItemFound);
router.patch('/:id/mark-not-found', isAuth, postController.markItemNotFound);
router.patch('/:id/return-status', isAuth, postController.updateReturnStatus);
router.patch('/:id/ban', isAuth, postController.banPost);
router.patch('/:id/unban', isAuth, postController.unbanPost);

export default router;

