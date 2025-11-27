import { NOTIFICATIONMODEL } from "../models/notificationModel.js";

const createNotification = async (payload) => {
    try {
        const result = await NOTIFICATIONMODEL.createNotification(payload);
        return result;
    } catch (error) {
        throw error;
    }
};

const getNotifications = async (userId, params) => {
    try {
        const result = await NOTIFICATIONMODEL.findNotifications(userId, params);
        return result;
    } catch (error) {
        throw error;
    }
};

const markAsRead = async (id, userId) => {
    try {
        const result = await NOTIFICATIONMODEL.markAsRead(id, userId);
        return result;
    } catch (error) {
        throw error;
    }
};

const markAllAsRead = async (userId) => {
    try {
        const result = await NOTIFICATIONMODEL.markAllAsRead(userId);
        return result;
    } catch (error) {
        throw error;
    }
};

export const notificationServices = {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead
};

