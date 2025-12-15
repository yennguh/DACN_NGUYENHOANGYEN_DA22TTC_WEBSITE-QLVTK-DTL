import api from './axiosInterceptor';

// Lấy settings theo type
export const getSettings = async (type) => {
    try {
        const response = await api.get(`/v1/settings/${type}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching settings:', error);
        return null;
    }
};

// Cập nhật settings
export const updateSettings = async (type, data) => {
    try {
        const response = await api.put(`/v1/settings/${type}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating settings:', error);
        throw error;
    }
};
