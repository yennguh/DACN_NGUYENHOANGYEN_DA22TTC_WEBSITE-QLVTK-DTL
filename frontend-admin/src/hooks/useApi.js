import { useState, useCallback } from 'react';

/**
 * Custom hook để xử lý API calls với loading, error states và retry
 * @param {Function} apiFunction - Hàm API cần gọi
 * @param {Object} options - Các tùy chọn
 * @returns {Object} - { data, loading, error, execute, reset }
 */
export const useApi = (apiFunction, options = {}) => {
    const { 
        onSuccess, 
        onError, 
        initialData = null,
        showErrorAlert = false 
    } = options;

    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...args) => {
        setLoading(true);
        setError(null);

        try {
            const result = await apiFunction(...args);
            setData(result);
            onSuccess?.(result);
            return result;
        } catch (err) {
            const errorMessage = err.response?.data?.message 
                || err.message 
                || 'Đã xảy ra lỗi. Vui lòng thử lại.';
            
            setError(errorMessage);
            onError?.(err);

            if (showErrorAlert) {
                // Không alert nếu là lỗi mạng (đã có NetworkStatus banner)
                if (!err.isOffline && !err.isNetworkError) {
                    console.error('API Error:', errorMessage);
                }
            }

            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFunction, onSuccess, onError, showErrorAlert]);

    const reset = useCallback(() => {
        setData(initialData);
        setError(null);
        setLoading(false);
    }, [initialData]);

    return { data, loading, error, execute, reset };
};

/**
 * Hook để lưu cache dữ liệu vào localStorage
 * @param {string} key - Key để lưu trong localStorage
 * @param {*} initialValue - Giá trị mặc định
 */
export const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Error reading localStorage:', error);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error('Error setting localStorage:', error);
        }
    };

    const removeValue = () => {
        try {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {
            console.error('Error removing localStorage:', error);
        }
    };

    return [storedValue, setValue, removeValue];
};

/**
 * Hook để debounce giá trị (hữu ích cho search)
 * @param {*} value - Giá trị cần debounce
 * @param {number} delay - Thời gian delay (ms)
 */
export const useDebounce = (value, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useState(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

export default useApi;
