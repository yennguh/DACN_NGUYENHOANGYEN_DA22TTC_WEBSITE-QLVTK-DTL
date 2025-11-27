import axios from 'axios';
import Cookies from 'js-cookie';

// Lấy baseURL từ biến môi trường hoặc dùng giá trị mặc định
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8017';

// Khởi tạo một instance riêng
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor cho Request
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('accessToken'); // hoặc từ context/store
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Nếu là FormData, không set Content-Type để browser tự động set với boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor cho Response
api.interceptors.response.use(
    (response) => {
        // Có thể xử lý response ở đây nếu cần
        return response;
    },
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                console.warn('Unauthorized - Token có thể hết hạn');
                // redirect to login page hoặc refresh token tại đây
            }
            // Chỉ hiển thị alert 403 cho các action cần quyền (POST, PUT, DELETE, PATCH)
            // Không hiển thị cho GET requests (có thể là public endpoints)
            if (error.response.status === 403) {
                const method = error.config?.method?.toUpperCase();
                if (method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
                    alert('Bạn không có quyền thực hiện hành động này.');
                } else {
                    // GET request bị 403 - chỉ log, không alert
                    console.warn('Forbidden - Không có quyền truy cập:', error.config?.url);
                }
            }
            if (error.response.status === 500) {
                alert('Lỗi server. Vui lòng thử lại sau.');
            }
        }
        return Promise.reject(error);
    }
);

export default api;
