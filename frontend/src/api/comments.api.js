import api from './axiosInterceptor';

export const fetchCommentsByPostId = async (postId, params = {}) => {
    try {
        const response = await api.get(`/v1/comments/post/${postId}`, { params });
        return response.data;
    } catch (error) {
        console.error('Lỗi lấy bình luận:', error.response?.data || error.message);
        return null;
    }
};

export const createComment = async (payload) => {
    try {
        const response = await api.post('/v1/comments', payload);
        return response.data;
    } catch (error) {
        console.error('Lỗi tạo bình luận:', error.response?.data || error.message);
        throw error;
    }
};

export const updateComment = async (id, payload) => {
    try {
        const response = await api.put(`/v1/comments/${id}`, payload);
        return response.data;
    } catch (error) {
        console.error('Lỗi cập nhật bình luận:', error.response?.data || error.message);
        throw error;
    }
};

export const deleteComment = async (id) => {
    try {
        const response = await api.delete(`/v1/comments/${id}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi xóa bình luận:', error.response?.data || error.message);
        throw error;
    }
};
