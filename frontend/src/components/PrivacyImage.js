import { useEffect, useRef, useState, useContext, useMemo } from 'react';
import { Eye, Loader2 } from 'lucide-react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import { AuthContext } from '../core/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { getImageUrl } from '../utils/constant';

/**
 * PrivacyImage - Dùng AI để làm mờ chỉ đồ vật, giữ nền rõ
 * @param {string} postOwnerId - ID của chủ bài đăng (nếu có)
 * @param {boolean} blur - Có blur hay không (mặc định true)
 * @param {boolean} forceBlurAll - Nếu true, blur tất cả trừ Admin (dùng cho trang danh sách)
 * @param {boolean} isPublicView - Nếu true, không blur (dùng khi xem profile công khai hoặc chi tiết bài đăng)
 */
const PrivacyImage = ({ src: rawSrc, alt, className = '', blur = true, onClick, postOwnerId, forceBlurAll = false, isPublicView = false, ...props }) => {
    const { token } = useContext(AuthContext);
    
    // Xử lý URL ảnh
    const src = useMemo(() => getImageUrl(rawSrc), [rawSrc]);
    
    // Kiểm tra xem user hiện tại có cần blur không
    const needBlur = useMemo(() => {
        if (!blur) return false;
        
        // Nếu là public view (xem chi tiết bài đăng, xem profile) -> không blur
        if (isPublicView) return false;
        
        if (!token) return true; // Chưa đăng nhập -> blur
        
        try {
            const decoded = jwtDecode(token);
            const roles = decoded.roles || [];
            const currentUserId = decoded._id || decoded.id;
            
            // Admin không bị blur
            if (roles.includes('admin')) return false;
            
            // Nếu forceBlurAll = true (trang danh sách), blur tất cả trừ Admin
            if (forceBlurAll) return true;
            
            // Chủ bài đăng không bị blur (chỉ khi không forceBlurAll)
            if (postOwnerId && currentUserId) {
                const ownerId = String(postOwnerId);
                const userId = String(currentUserId);
                if (ownerId === userId) return false;
            }
            
            return true; // Người khác -> blur
        } catch (err) {
            return true;
        }
    }, [blur, token, postOwnerId, forceBlurAll, isPublicView]);
    
    const canvasRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [processed, setProcessed] = useState(false);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        // Reset states khi src thay đổi
        setLoading(true);
        setProcessed(false);
        setImgError(false);
        
        if (!src) {
            setLoading(false);
            return;
        }
        
        if (!needBlur) {
            setLoading(false);
            return;
        }

        const processImage = async () => {
            try {
                const img = new Image();
                // Chỉ set crossOrigin nếu không phải base64
                if (!src.startsWith('data:')) {
                    img.crossOrigin = 'anonymous';
                }
                img.src = src;
                
                img.onload = async () => {
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    // Vẽ ảnh gốc
                    ctx.drawImage(img, 0, 0);
                    
                    try {
                        // Load model và detect objects
                        const model = await cocoSsd.load();
                        const predictions = await model.detect(img);
                        
                        // Tạo canvas tạm để blur đậm
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = img.width;
                        tempCanvas.height = img.height;
                        const tempCtx = tempCanvas.getContext('2d');
                        tempCtx.filter = 'blur(25px)';
                        tempCtx.drawImage(img, 0, 0);
                        
                        // Vẽ ảnh gốc (nền rõ)
                        ctx.drawImage(img, 0, 0);
                        
                        if (predictions.length > 0) {
                            // Blur vùng có đồ vật được AI detect
                            predictions.forEach(pred => {
                                const [x, y, width, height] = pred.bbox;
                                ctx.drawImage(tempCanvas, x, y, width, height, x, y, width, height);
                            });
                        } else {
                            // Không detect được -> blur vùng giữa ảnh (60% diện tích)
                            const centerX = img.width * 0.2;
                            const centerY = img.height * 0.2;
                            const centerW = img.width * 0.6;
                            const centerH = img.height * 0.6;
                            ctx.drawImage(tempCanvas, centerX, centerY, centerW, centerH, centerX, centerY, centerW, centerH);
                        }
                        
                        setProcessed(true);
                    } catch (err) {
                        console.error('AI detect error:', err);
                        // Fallback: blur vùng giữa ảnh
                        ctx.drawImage(img, 0, 0);
                        const tempCanvas2 = document.createElement('canvas');
                        tempCanvas2.width = img.width;
                        tempCanvas2.height = img.height;
                        const tempCtx2 = tempCanvas2.getContext('2d');
                        tempCtx2.filter = 'blur(25px)';
                        tempCtx2.drawImage(img, 0, 0);
                        const cx = img.width * 0.2, cy = img.height * 0.2;
                        const cw = img.width * 0.6, ch = img.height * 0.6;
                        ctx.drawImage(tempCanvas2, cx, cy, cw, ch, cx, cy, cw, ch);
                        setProcessed(true);
                    }
                    
                    setLoading(false);
                };
                
                img.onerror = () => {
                    console.error('Image load error:', src?.substring(0, 100));
                    setImgError(true);
                    setLoading(false);
                };
            } catch (err) {
                console.error('Process image error:', err);
                setImgError(true);
                setLoading(false);
            }
        };

        processImage();
    }, [src, needBlur]);

    // Nếu không có src, hiển thị placeholder
    if (!src) {
        return (
            <div className={`${className} bg-gray-200 flex items-center justify-center`} onClick={onClick}>
                <span className="text-gray-400 text-sm">Không có ảnh</span>
            </div>
        );
    }

    // Hiển thị lỗi nếu ảnh không load được
    if (imgError) {
        return (
            <div className={`${className} bg-gray-200 flex items-center justify-center`} onClick={onClick}>
                <span className="text-gray-400 text-sm">Không thể tải ảnh</span>
            </div>
        );
    }

    // Không blur - hiển thị ảnh gốc
    if (!needBlur) {
        return (
            <img 
                src={src} 
                alt={alt} 
                className={className} 
                onClick={onClick} 
                onError={() => setImgError(true)} 
                {...props} 
            />
        );
    }

    return (
        <div className="relative group cursor-pointer" onClick={onClick}>
            {/* Canvas hiển thị ảnh đã xử lý */}
            <canvas
                ref={canvasRef}
                className={className}
                style={{ display: processed ? 'block' : 'none' }}
            />
            
            {/* Ảnh gốc blur nhẹ (fallback khi đang load) */}
            {!processed && (
                <img
                    src={src}
                    alt={alt}
                    className={className}
                    style={{ filter: 'blur(15px)' }}
                    onError={() => setImgError(true)}
                    {...props}
                />
            )}
            
            {/* Loading indicator */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
            )}
            
            {/* Overlay xem chi tiết - chỉ hiện khi hover */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all opacity-0 group-hover:opacity-100">
                <div className="bg-white/90 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg transform scale-90 group-hover:scale-100 transition-all">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Xem chi tiết</span>
                </div>
            </div>
        </div>
    );
};

export default PrivacyImage;
