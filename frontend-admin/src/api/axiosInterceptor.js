import axios from 'axios';
import Cookies from 'js-cookie';

// Lấy baseURL từ biến môi trường hoặc dùng giá trị mặc định
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8017';

// Cấu hình retry
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 giây

// Hàm delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Hàm kiểm tra có nên retry không
const shouldRetry = (error) => {
    // Retry khi: timeout, network error, hoặc server error 5xx
    if (!error.response) {
        // Network error hoặc timeout
        return true;
    }
    // Retry cho server errors (500, 502, 503, 504)
    const status = error.response.status;
    return status >= 500 && status <= 504;
};

// Khởi tạo một instance riêng
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000, // Tăng timeout lên 15 giây
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor cho Request
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Nếu là FormData, không set Content-Type để browser tự động set với boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        // Thêm retry count vào config
        config.retryCount = config.retryCount || 0;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor cho Response với retry logic
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const config = error.config;

        // Kiểm tra offline
        if (!navigator.onLine) {
            console.warn('Không có kết nối mạng');
            return Promise.reject({
                ...error,
                message: 'Không có kết nối mạng. Vui lòng kiểm tra lại.',
                isOffline: true
            });
        }

        // Retry logic
        if (shouldRetry(error) && config && config.retryCount < MAX_RETRIES) {
            config.retryCount += 1;
            console.log(`Đang thử lại lần ${config.retryCount}/${MAX_RETRIES}...`);
            
            // Exponential backoff: 1s, 2s, 4s
            await delay(RETRY_DELAY * Math.pow(2, config.retryCount - 1));
            
            return api(config);
        }

        // Xử lý các loại lỗi
        if (error.code === 'ECONNABORTED') {
            console.warn('Request timeout');
            return Promise.reject({
                ...error,
                message: 'Kết nối quá chậm. Vui lòng thử lại.',
                isTimeout: true
            });
        }

        if (!error.response) {
            // Network error
            console.warn('Network error:', error.message);
            return Promise.reject({
                ...error,
                message: 'Không thể kết nối đến server. Vui lòng kiểm tra mạng.',
                isNetworkError: true
            });
        }

        // HTTP errors
        const status = error.response.status;
        
        if (status === 401) {
            console.warn('Unauthorized - Token có thể hết hạn');
            // Có thể thêm logic refresh token ở đây
        }
        
        if (status === 403) {
            const method = config?.method?.toUpperCase();
            if (method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
                console.warn('Forbidden - Không có quyền thực hiện hành động');
            }
        }
        
        if (status >= 500) {
            console.warn('Server error:', status);
        }

        return Promise.reject(error);
    }
);

// Hàm helper để kiểm tra trạng thái mạng
export const checkConnection = async () => {
    if (!navigator.onLine) {
        return { online: false, message: 'Không có kết nối mạng' };
    }
    
    try {
        await api.get('/health', { timeout: 5000, retryCount: MAX_RETRIES }); // Skip retry for health check
        return { online: true, message: 'Kết nối ổn định' };
    } catch (error) {
        return { online: false, message: 'Không thể kết nối đến server' };
    }
};

export default api;
