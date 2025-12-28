import { StatusCodes } from "http-status-codes";
import { contactServices } from "../services/contactServices.js";
import { notificationServices } from "../services/notificationServices.js";
import { userServices } from "../services/userServices.js";

const createContact = async (req, res, next) => {
    try {
        // Optional: check if user is authenticated (middleware isAuth is optional)
        const decoded = req.jwtDecoded || null;
        const payload = {
            ...req.body,
            userId: decoded?._id || null
        };
        const result = await contactServices.createContact(payload);
        res.status(StatusCodes.CREATED).json({
            message: 'Contact message sent successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getContacts = async (req, res, next) => {
    try {
        const decoded = req.jwtDecoded;
        // Only admin can view all contacts
        if (!decoded) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'Only admin can view contacts' });
        }

        const params = req.query;
        const result = await contactServices.getContacts(params);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

const updateContact = async (req, res, next) => {
    try {
        const decoded = req.jwtDecoded;
        if (!decoded || !decoded.roles?.includes('admin')) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'Only admin can update contacts' });
        }

        const { id } = req.params;
        const result = await contactServices.updateContact(id, req.body);
        res.status(StatusCodes.OK).json({
            message: 'Contact updated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const addReply = async (req, res, next) => {
    try {
        const decoded = req.jwtDecoded;
        const { id } = req.params;
        const { message } = req.body;

        // Lấy URL ảnh nếu có upload
        let imageUrl = null;
        if (req.file) {
            imageUrl = `/uploads/images/${req.file.filename}`;
        }

        if (!message && !imageUrl) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Message or image is required' });
        }

        // Determine sender type
        const isAdmin = decoded && decoded.roles?.includes('admin');
        
        // Lấy thông tin user (bao gồm avatar)
        let senderInfo = { fullname: 'User', avatar: null };
        if (decoded?._id) {
            try {
                const userInfo = await userServices.GetUserInfor(decoded._id);
                if (userInfo) {
                    senderInfo.fullname = userInfo.fullname || 'User';
                    senderInfo.avatar = userInfo.avatar || null;
                }
            } catch (err) {
                console.log('Error fetching user info for reply:', err);
            }
        }
        
        const replyData = {
            message: message || '',
            sender: isAdmin ? 'admin' : 'user',
            senderId: decoded?._id || null,
            senderName: isAdmin ? senderInfo.fullname : (decoded?.fullname || req.body.senderName || 'User'),
            senderAvatar: senderInfo.avatar,
            createdAt: Date.now()
        };
        
        // Chỉ thêm image nếu có
        if (imageUrl) {
            replyData.image = imageUrl;
        }

        const result = await contactServices.addReply(id, replyData);

        // Gửi thông báo cho user khi admin phản hồi
        if (isAdmin && result?.userId) {
            try {
                await notificationServices.createNotification({
                    userId: result.userId,
                    title: 'Phản hồi từ Admin',
                    message: `Admin đã phản hồi tin nhắn của bạn: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`,
                    type: 'message_received',
                    relatedId: id
                });
            } catch (notifyError) {
                console.error('Failed to create reply notification:', notifyError);
            }
        }

        res.status(StatusCodes.OK).json({
            message: 'Reply sent successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getMyContacts = async (req, res, next) => {
    try {
        const decoded = req.jwtDecoded;
        if (!decoded || !decoded._id) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }

        const contacts = await contactServices.getContactByUserId(decoded._id);
        res.status(StatusCodes.OK).json({
            data: contacts
        });
    } catch (error) {
        next(error);
    }
};

export const contactController = {
    createContact,
    getContacts,
    updateContact,
    addReply,
    getMyContacts
};

