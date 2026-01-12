import api from './axiosInterceptor';

export const sendContact = async (payload) => {
    try {
        const response = await api.post('/v1/contact', payload);
        return response.data;
    } catch (error) {
        console.error("Lỗi gửi liên hệ:", error.response?.data || error.message);
        throw error;
    }
};

export const fetchContacts = async (params = {}) => {
    try {
        const response = await api.get('/v1/contact', { params });
        return response.data;
    } catch (error) {
        console.error("Lỗi lấy danh sách liên hệ:", error.response?.data || error.message);
        return null;
    }
};

export const updateContact = async (id, payload) => {
    try {
        const response = await api.put(`/v1/contact/${id}`, payload);
        return response.data;
    } catch (error) {
        console.error("Lỗi cập nhật liên hệ:", error.response?.data || error.message);
        throw error;
    }
};

export const deleteContact = async (id) => {
    try {
        const response = await api.delete(`/v1/contact/${id}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi xóa liên hệ:", error.response?.data || error.message);
        throw error;
    }
};

// Xóa chỉ phía admin (ẩn với admin nhưng user vẫn thấy)
export const hideContactForAdmin = async (id) => {
    try {
        const response = await api.patch(`/v1/contact/${id}/hide-admin`);
        return response.data;
    } catch (error) {
        console.error("Lỗi ẩn liên hệ:", error.response?.data || error.message);
        throw error;
    }
};

export const getMyContacts = async () => {
    try {
        const response = await api.get('/v1/contact/my-contacts');
        return response.data;
    } catch (error) {
        console.error("Lỗi lấy danh sách liên hệ của tôi:", error.response?.data || error.message);
        throw error;
    }
};

export const addReply = async (contactId, message, imageFile = null) => {
    try {
        const formData = new FormData();
        formData.append('message', message || '');
        if (imageFile) {
            formData.append('image', imageFile);
        }
        // Không set Content-Type header để browser tự động set với boundary
        const response = await api.post(`/v1/contact/${contactId}/reply`, formData);
        return response.data;
    } catch (error) {
        console.error("Lỗi gửi phản hồi:", error.response?.data || error.message);
        throw error;
    }
};

export const getContactById = async (id) => {
    try {
        const response = await api.get(`/v1/contact/${id}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi lấy chi tiết liên hệ:", error.response?.data || error.message);
        throw error;
    }
};

// Xóa một reply cụ thể (admin)
export const deleteReply = async (contactId, replyIndex) => {
    try {
        const response = await api.delete(`/v1/contact/${contactId}/reply/${replyIndex}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi xóa tin nhắn:", error.response?.data || error.message);
        throw error;
    }
};

