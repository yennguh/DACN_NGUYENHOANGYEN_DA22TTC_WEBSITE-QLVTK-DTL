import express from 'express';
import { notificationController } from '../controllers/notificationController.js';
import { isAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.get('/', isAuth, notificationController.getNotifications);
router.patch('/:id/read', isAuth, notificationController.markAsRead);
router.patch('/read-all', isAuth, notificationController.markAllAsRead);

export default router;

