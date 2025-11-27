import express from 'express';
import { postController } from '../controllers/postController.js';
import { isAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', postController.getPosts);
router.get('/stats/top-posters', isAuth, postController.getTopPosters);
router.get('/:id', postController.getPostById);
// Like/unlike
router.post('/:id/like', isAuth, postController.toggleLike);

// Protected routes (require authentication)
router.post('/', isAuth, postController.createPost);
router.put('/:id', isAuth, postController.updatePost);
router.delete('/:id', isAuth, postController.deletePost);

// Admin routes
router.patch('/:id/approve', isAuth, postController.approvePost);
router.patch('/:id/reject', isAuth, postController.rejectPost);
router.patch('/:id/mark-found', isAuth, postController.markItemFound);
router.patch('/:id/mark-not-found', isAuth, postController.markItemNotFound);

export default router;

