import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8017';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 và chưa retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            const refreshToken = Cookies.get('refreshToken');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/v1/users/refresh-token`, {
                        refreshToken: refreshToken
                    });

                    const { accessToken, refreshToken: newRefreshToken } = response.data;
                    
                    Cookies.set('accessToken', accessToken, { expires: 7 });
                    if (newRefreshToken) {
                        Cookies.set('refreshToken', newRefreshToken, { expires: 30 });
                    }

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh token cũng hết hạn, xóa tất cả
                    Cookies.remove('accessToken');
                    Cookies.remove('refreshToken');
                    localStorage.removeItem('currentUser');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            } else {
                // Không có refresh token
                Cookies.remove('accessToken');
                localStorage.removeItem('currentUser');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
