import api from './axiosInterceptor';

export const fetchNotifications = async (params = {}) => {
    try {
        const response = await api.get('/v1/notifications', { params });
        return response.data;
    } catch (error) {
        console.error("Lỗi lấy thông báo:", error.response?.data || error.message);
        return null;
    }
};

export const markAsRead = async (id) => {
    try {
        const response = await api.patch(`/v1/notifications/${id}/read`);
        return response.data;
    } catch (error) {
        console.error("Lỗi đánh dấu đã đọc:", error.response?.data || error.message);
        throw error;
    }
};

export const markAllAsRead = async () => {
    try {
        const response = await api.patch('/v1/notifications/read-all');
        return response.data;
    } catch (error) {
        console.error("Lỗi đánh dấu tất cả đã đọc:", error.response?.data || error.message);
        throw error;
    }
};

