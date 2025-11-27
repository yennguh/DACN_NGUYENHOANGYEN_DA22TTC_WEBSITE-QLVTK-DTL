import express from 'express';
import { commentController } from '../controllers/commentController.js';
import { isAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public: get comments for a post
router.get('/post/:postId', commentController.getCommentsByPostId);

// Protected: create comment
router.post('/', isAuth, commentController.createComment);

// Protected: update or delete comment
router.put('/:id', isAuth, commentController.updateComment);
router.delete('/:id', isAuth, commentController.deleteComment);

export default router;
