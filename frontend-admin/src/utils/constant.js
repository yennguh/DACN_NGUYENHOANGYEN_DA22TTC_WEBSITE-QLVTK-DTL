// Lấy API root từ biến môi trường hoặc dùng giá trị mặc định
export const API_ROOT = process.env.REACT_APP_API_URL || "http://localhost:8017"

// Helper function để xử lý image URL từ backend
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Nếu đã là full URL (http/https), trả về nguyên
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    // Nếu là base64, trả về nguyên
    if (imagePath.startsWith('data:')) {
        return imagePath;
    }
    
    // Nếu là relative path, thêm baseURL
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${API_ROOT}${cleanPath}`;
};