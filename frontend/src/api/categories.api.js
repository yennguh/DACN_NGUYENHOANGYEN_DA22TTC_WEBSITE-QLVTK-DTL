import api from './axiosInterceptor';

// Lấy tất cả categories
export const fetchCategories = async () => {
    try {
        const response = await api.get('/v1/categories');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};

// Thêm category mới
export const createCategory = async (data) => {
    try {
        const response = await api.post('/v1/categories', data);
        return response.data;
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
};

// Cập nhật category
export const updateCategory = async (id, data) => {
    try {
        const response = await api.put(`/v1/categories/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
};

// Xóa category
export const deleteCategory = async (id) => {
    try {
        const response = await api.delete(`/v1/categories/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
};
