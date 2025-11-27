import express from 'express'
import { StatusCodes } from 'http-status-codes';
import multer from 'multer';
import { userController } from '../controllers/userController.js';
import { isAuth } from '../middlewares/authMiddleware.js';
import { uploadAvatar } from '../middlewares/uploadMiddleware.js';

const Router = express.Router();

// Error handler for multer
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'File quá lớn. Kích thước tối đa là 5MB' });
        }
        return res.status(StatusCodes.BAD_REQUEST).json({ message: err.message });
    }
    if (err) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: err.message });
    }
    next();
};

Router.post('/login', userController.Login)
Router.post('/register', userController.CreatedUser)
Router.get('/inforUser', isAuth, userController.InfoUser)
Router.post('/refresh-token', userController.refreshToken)
Router.get('/list', isAuth, userController.ListUsers)
Router.put('/updateUser', isAuth, uploadAvatar, handleUploadError, userController.UpdateUser)
Router.delete('/:id', isAuth, userController.DeleteUser)
export default Router