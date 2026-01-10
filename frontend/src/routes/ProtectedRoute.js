import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../core/AuthContext";

// ProtectedRoute cho user thường - chỉ yêu cầu đăng nhập
export default function ProtectedRoute() {
    const { token, loadingUser } = useContext(AuthContext);
    const location = useLocation();

    // Đợi load user xong
    if (loadingUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (!token) {
        // Redirect về login và lưu lại trang hiện tại
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
}
