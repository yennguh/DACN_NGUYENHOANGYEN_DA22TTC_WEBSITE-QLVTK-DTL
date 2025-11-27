import express from 'express';
import { contactController } from '../controllers/contactController.js';
import { isAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route - anyone can send contact message
router.post('/', contactController.createContact);

// User routes - get own contacts (require authentication)
router.get('/my-contacts', isAuth, contactController.getMyContacts);

// Admin routes - require authentication
router.get('/', isAuth, contactController.getContacts);
router.put('/:id', isAuth, contactController.updateContact);
router.post('/:id/reply', isAuth, contactController.addReply);

export default router;

