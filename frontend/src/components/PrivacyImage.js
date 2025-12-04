import { useEffect, useRef, useState } from 'react';
import { Eye, Loader2 } from 'lucide-react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

/**
 * PrivacyImage - Dùng AI để làm mờ chỉ đồ vật, giữ nền rõ
 */
const PrivacyImage = ({ src, alt, className = '', blur = true, onClick, ...props }) => {
    const canvasRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [processed, setProcessed] = useState(false);

    useEffect(() => {
        if (!blur) {
            setLoading(false);
            return;
        }

        const processImage = async () => {
            try {
                const img = new Image();
                img.crossOrigin = 'anonymous';
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
                    setLoading(false);
                };
            } catch (err) {
                console.error('Process image error:', err);
                setLoading(false);
            }
        };

        processImage();
    }, [src, blur]);

    // Không blur
    if (!blur) {
        return <img src={src} alt={alt} className={className} onClick={onClick} {...props} />;
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
                    {...props}
                />
            )}
            
            {/* Loading indicator */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
            )}
            
            {/* Overlay xem chi tiết */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <div className="bg-white/80 px-3 py-1.5 rounded-full flex items-center gap-2 shadow">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">Xem chi tiết</span>
                </div>
            </div>
        </div>
    );
};

export default PrivacyImage;
