import api from './axiosInterceptor';

export const fetchPosts = async (params = {}) => {
    try {
        const response = await api.get('/v1/posts', { params });
        return response.data;
    } catch (error) {
        // Xử lý lỗi một cách im lặng hơn cho public endpoints
        if (error.response?.status === 403) {
            console.warn("Không có quyền truy cập danh sách bài đăng. Có thể cần đăng nhập.");
        } else {
            console.error("Lỗi lấy danh sách bài đăng:", error.response?.data || error.message);
        }
        return null;
    }
};

export const fetchPostById = async (id) => {
    try {
        const response = await api.get(`/v1/posts/${id}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi lấy chi tiết bài đăng:", error.response?.data || error.message);
        return null;
    }
};

export const createPost = async (payload) => {
    try {
        const response = await api.post('/v1/posts', payload);
        return response.data;
    } catch (error) {
        console.error("Lỗi tạo bài đăng:", error.response?.data || error.message);
        throw error;
    }
};

export const updatePost = async (id, payload) => {
    try {
        const response = await api.put(`/v1/posts/${id}`, payload);
        return response.data;
    } catch (error) {
        console.error("Lỗi cập nhật bài đăng:", error.response?.data || error.message);
        throw error;
    }
};

export const deletePost = async (id) => {
    try {
        const response = await api.delete(`/v1/posts/${id}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi xóa bài đăng:", error.response?.data || error.message);
        throw error;
    }
};

export const approvePost = async (id) => {
    try {
        const response = await api.patch(`/v1/posts/${id}/approve`);
        return response.data;
    } catch (error) {
        console.error("Lỗi duyệt bài đăng:", error.response?.data || error.message);
        throw error;
    }
};

export const rejectPost = async (id) => {
    try {
        const response = await api.patch(`/v1/posts/${id}/reject`);
        return response.data;
    } catch (error) {
        console.error("Lỗi từ chối bài đăng:", error.response?.data || error.message);
        throw error;
    }
};

export const fetchTopPosters = async () => {
    try {
        const response = await api.get('/v1/posts/stats/top-posters');
        return response.data;
    } catch (error) {
        // Xử lý lỗi một cách im lặng hơn cho public endpoints
        if (error.response?.status === 403) {
            console.warn("Không có quyền truy cập thống kê. Có thể cần đăng nhập.");
        } else {
            console.error("Lỗi lấy thống kê người đăng nhiều nhất:", error.response?.data || error.message);
        }
        return null;
    }
};

export const toggleLikePost = async (postId) => {
    try {
        const response = await api.post(`/v1/posts/${postId}/like`);
        return response.data;
    } catch (error) {
        console.error('Lỗi like/unlike bài đăng:', error.response?.data || error.message);
        throw error;
    }
};

export const markItemFound = async (id) => {
    try {
        const response = await api.patch(`/v1/posts/${id}/mark-found`);
        return response.data;
    } catch (error) {
        console.error("Lỗi xác nhận tìm thấy:", error.response?.data || error.message);
        throw error;
    }
};

export const markItemNotFound = async (id) => {
    try {
        const response = await api.patch(`/v1/posts/${id}/mark-not-found`);
        return response.data;
    } catch (error) {
        console.error("Lỗi xác nhận chưa tìm thấy:", error.response?.data || error.message);
        throw error;
    }
};

export const updateReturnStatus = async (id, returnStatus) => {
    try {
        const response = await api.patch(`/v1/posts/${id}/return-status`, { returnStatus });
        return response.data;
    } catch (error) {
        console.error("Lỗi cập nhật trạng thái trả:", error.response?.data || error.message);
        throw error;
    }
};

export const banPost = async (id, reason) => {
    try {
        const response = await api.patch(`/v1/posts/${id}/ban`, { reason });
        return response.data;
    } catch (error) {
        console.error("Lỗi cấm bài đăng:", error.response?.data || error.message);
        throw error;
    }
};

export const unbanPost = async (id) => {
    try {
        const response = await api.patch(`/v1/posts/${id}/unban`);
        return response.data;
    } catch (error) {
        console.error("Lỗi gỡ cấm bài đăng:", error.response?.data || error.message);
        throw error;
    }
};

// Chia sẻ bài đăng - tạo bài mới với thông tin bài gốc được nhúng
export const sharePost = async (originalPostId, shareComment = '') => {
    try {
        const response = await api.post('/v1/posts/share', { originalPostId, shareComment });
        return response.data;
    } catch (error) {
        console.error("Lỗi chia sẻ bài đăng:", error.response?.data || error.message);
        throw error;
    }
};

