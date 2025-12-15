import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { GET_DB } from '../config/mongodb.js';
import { ObjectId } from 'mongodb';
import { isAuth } from '../middlewares/authMiddleware.js';

const Router = express.Router();

// Lấy tất cả categories (public)
Router.get('/', async (req, res) => {
    try {
        const categories = await GET_DB()
            .collection('categories')
            .find({ isActive: true })
            .sort({ order: 1 })
            .toArray();
        
        res.status(StatusCodes.OK).json(categories);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
});

// Thêm category mới (admin only)
Router.post('/', isAuth, async (req, res) => {
    try {
        const { name, icon, description, order } = req.body;
        
        if (!name) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Tên danh mục là bắt buộc' });
        }
        
        const newCategory = {
            name,
            icon: icon || '📦',
            description: description || '',
            order: order || 99,
            isActive: true,
            createdAt: new Date()
        };
        
        const result = await GET_DB().collection('categories').insertOne(newCategory);
        
        res.status(StatusCodes.CREATED).json({
            message: 'Thêm danh mục thành công',
            data: { ...newCategory, _id: result.insertedId }
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
});

// Cập nhật category (admin only)
Router.put('/:id', isAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body, updatedAt: new Date() };
        delete updateData._id;
        
        const result = await GET_DB().collection('categories').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy danh mục' });
        }
        
        res.status(StatusCodes.OK).json({ message: 'Cập nhật thành công' });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
});

// Xóa category (admin only)
Router.delete('/:id', isAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await GET_DB().collection('categories').deleteOne({ _id: new ObjectId(id) });
        
        if (result.deletedCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy danh mục' });
        }
        
        res.status(StatusCodes.OK).json({ message: 'Xóa thành công' });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
});

export default Router;
