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
        // Nếu có file ảnh, sử dụng FormData
        if (payload.image) {
            const formData = new FormData();
            formData.append('postId', payload.postId);
            formData.append('content', payload.content);
            formData.append('image', payload.image);
            
            const response = await api.post('/v1/comments', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        }
        
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

export const toggleLikeComment = async (id) => {
    try {
        const response = await api.post(`/v1/comments/${id}/like`);
        return response.data;
    } catch (error) {
        console.error('Lỗi like bình luận:', error.response?.data || error.message);
        throw error;
    }
};

export const replyComment = async (id, content) => {
    try {
        const response = await api.post(`/v1/comments/${id}/reply`, { content });
        return response.data;
    } catch (error) {
        console.error('Lỗi trả lời bình luận:', error.response?.data || error.message);
        throw error;
    }
};
