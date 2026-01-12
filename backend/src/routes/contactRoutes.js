import express from 'express';
import { contactController } from '../controllers/contactController.js';
import { isAuth, optionalAuth } from '../middlewares/authMiddleware.js';
import { uploadContactImage } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Public route - anyone can send contact message (nhưng lấy userId nếu đã đăng nhập)
router.post('/', optionalAuth, contactController.createContact);

// User routes - get own contacts (require authentication)
router.get('/my-contacts', isAuth, contactController.getMyContacts);

// User routes - xóa/thu hồi tin nhắn của mình
router.patch('/:id/hide-user', isAuth, contactController.hideForUser);
router.delete('/:id/recall', isAuth, contactController.recallContact);
router.delete('/:id/reply/:replyIndex', isAuth, contactController.deleteReply);

// Admin routes - require authentication
router.get('/', isAuth, contactController.getContacts);
router.put('/:id', isAuth, contactController.updateContact);
router.post('/:id/reply', isAuth, uploadContactImage, contactController.addReply);
router.delete('/:id', isAuth, contactController.deleteContact); // Xóa hoàn toàn (admin)
router.patch('/:id/hide-admin', isAuth, contactController.hideForAdmin); // Ẩn chỉ phía admin

export default router;

