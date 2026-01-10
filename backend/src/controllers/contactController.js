import { StatusCodes } from "http-status-codes";
import { contactServices } from "../services/contactServices.js";
import { notificationServices } from "../services/notificationServices.js";
import { userServices } from "../services/userServices.js";

const createContact = async (req, res, next) => {
    try {
        // Optional: check if user is authenticated (middleware isAuth is optional)
        const decoded = req.jwtDecoded || null;
        
        // Đảm bảo userId được lưu dưới dạng string
        let userId = null;
        if (decoded?._id) {
            userId = typeof decoded._id === 'string' ? decoded._id : decoded._id.toString();
            
            // Kiểm tra user có bị chặn không
            const userInfo = await userServices.GetUserInfor(userId);
            if (userInfo && userInfo.blockedFromContact === true) {
                return res.status(StatusCodes.FORBIDDEN).json({ 
                    message: 'Tài khoản của bạn đã bị chặn khỏi tính năng liên hệ. Vui lòng liên hệ admin để được hỗ trợ.',
                    blocked: true
                });
            }
        }
        
        const payload = {
            ...req.body,
            userId: userId
        };
        
        console.log('Creating contact with userId:', userId); // Debug log
        
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
        // Thêm param includeBlocked để lấy tin nhắn của user bị chặn
        const includeBlocked = params.includeBlocked === 'true';
        const result = await contactServices.getContacts({ ...params, includeBlocked });
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

// Xóa hoàn toàn tin nhắn (admin only)
const deleteContact = async (req, res, next) => {
    try {
        const decoded = req.jwtDecoded;
        if (!decoded || !decoded.roles?.includes('admin')) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'Only admin can delete contacts' });
        }

        const { id } = req.params;
        await contactServices.deleteContact(id);
        res.status(StatusCodes.OK).json({
            message: 'Contact deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Ẩn tin nhắn chỉ phía admin (user vẫn thấy)
const hideForAdmin = async (req, res, next) => {
    try {
        const decoded = req.jwtDecoded;
        if (!decoded || !decoded.roles?.includes('admin')) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'Only admin can hide contacts' });
        }

        const { id } = req.params;
        const result = await contactServices.updateContact(id, { hiddenForAdmin: true });
        res.status(StatusCodes.OK).json({
            message: 'Contact hidden for admin',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

// Ẩn tin nhắn chỉ phía user (admin vẫn thấy)
const hideForUser = async (req, res, next) => {
    try {
        const decoded = req.jwtDecoded;
        if (!decoded || !decoded._id) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }

        const { id } = req.params;
        // Kiểm tra xem contact có thuộc về user này không
        const contact = await contactServices.getContactById(id);
        if (!contact) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Contact not found' });
        }
        
        const userId = typeof decoded._id === 'string' ? decoded._id : decoded._id.toString();
        if (contact.userId !== userId) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'You can only hide your own contacts' });
        }

        const result = await contactServices.updateContact(id, { hiddenForUser: true });
        res.status(StatusCodes.OK).json({
            message: 'Contact hidden for user',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

// Thu hồi tin nhắn (user xóa cả 2 bên - chỉ với tin nhắn của mình)
const recallContact = async (req, res, next) => {
    try {
        const decoded = req.jwtDecoded;
        if (!decoded || !decoded._id) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }

        const { id } = req.params;
        // Kiểm tra xem contact có thuộc về user này không
        const contact = await contactServices.getContactById(id);
        if (!contact) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Contact not found' });
        }
        
        const userId = typeof decoded._id === 'string' ? decoded._id : decoded._id.toString();
        if (contact.userId !== userId) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'You can only recall your own contacts' });
        }

        await contactServices.deleteContact(id);
        res.status(StatusCodes.OK).json({
            message: 'Contact recalled successfully'
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
    getMyContacts,
    deleteContact,
    hideForAdmin,
    hideForUser,
    recallContact
};

