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
        if (message) {
            formData.append('message', message);
        }
        if (imageFile) {
            formData.append('image', imageFile);
        }
        const response = await api.post(`/v1/contact/${contactId}/reply`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
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

