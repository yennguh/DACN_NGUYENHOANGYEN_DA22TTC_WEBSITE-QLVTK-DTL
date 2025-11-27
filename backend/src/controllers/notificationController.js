import { StatusCodes } from "http-status-codes";
import { notificationServices } from "../services/notificationServices.js";

const getNotifications = async (req, res, next) => {
    try {
        const decoded = req.jwtDecoded;
        if (!decoded || !decoded._id) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }

        console.log('[notifications] decoded user:', decoded);

        const params = req.query;
        console.log('[notifications] query params:', params);

        const result = await notificationServices.getNotifications(decoded._id, params);
        console.log('[notifications] response preview:', {
            userId: decoded._id,
            total: result?.pagination?.total,
            returned: result?.data?.length
        });
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

const markAsRead = async (req, res, next) => {
    try {
        const decoded = req.jwtDecoded;
        if (!decoded || !decoded._id) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }

        const { id } = req.params;
        const result = await notificationServices.markAsRead(id, decoded._id);
        res.status(StatusCodes.OK).json({
            message: 'Notification marked as read',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const markAllAsRead = async (req, res, next) => {
    try {
        const decoded = req.jwtDecoded;
        if (!decoded || !decoded._id) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }

        const result = await notificationServices.markAllAsRead(decoded._id);
        res.status(StatusCodes.OK).json({
            message: 'All notifications marked as read',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const notificationController = {
    getNotifications,
    markAsRead,
    markAllAsRead
};

