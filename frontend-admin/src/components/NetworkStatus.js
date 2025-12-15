import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

const NetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showBanner, setShowBanner] = useState(false);
    const [isReconnecting, setIsReconnecting] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowBanner(true);
            // Ẩn banner sau 3 giây khi online lại
            setTimeout(() => setShowBanner(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowBanner(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleRetry = () => {
        setIsReconnecting(true);
        // Thử reload trang sau 1 giây
        setTimeout(() => {
            if (navigator.onLine) {
                window.location.reload();
            } else {
                setIsReconnecting(false);
            }
        }, 1000);
    };

    if (!showBanner) return null;

    return (
        <div className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
            isOnline ? 'bg-green-500' : 'bg-red-500'
        }`}>
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3">
                {isOnline ? (
                    <>
                        <Wifi className="w-5 h-5 text-white" />
                        <span className="text-white font-medium">Đã kết nối lại mạng!</span>
                    </>
                ) : (
                    <>
                        <WifiOff className="w-5 h-5 text-white" />
                        <span className="text-white font-medium">Mất kết nối mạng</span>
                        <button
                            onClick={handleRetry}
                            disabled={isReconnecting}
                            className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${isReconnecting ? 'animate-spin' : ''}`} />
                            {isReconnecting ? 'Đang thử...' : 'Thử lại'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default NetworkStatus;
