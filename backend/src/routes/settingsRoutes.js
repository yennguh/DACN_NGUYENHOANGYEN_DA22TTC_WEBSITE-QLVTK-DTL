import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { GET_DB } from '../config/mongodb.js';
import { isAuth } from '../middlewares/authMiddleware.js';

const Router = express.Router();

// Lấy settings theo type (public)
Router.get('/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const settings = await GET_DB().collection('settings').findOne({ type });
        
        if (!settings) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy cài đặt' });
        }
        
        res.status(StatusCodes.OK).json(settings);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
});

// Cập nhật settings (admin only)
Router.put('/:type', isAuth, async (req, res) => {
    try {
        const { type } = req.params;
        const updateData = { ...req.body, type, updatedAt: new Date() };
        
        const result = await GET_DB().collection('settings').updateOne(
            { type },
            { $set: updateData },
            { upsert: true }
        );
        
        res.status(StatusCodes.OK).json({ 
            message: 'Cập nhật thành công',
            data: updateData
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
});

export default Router;
