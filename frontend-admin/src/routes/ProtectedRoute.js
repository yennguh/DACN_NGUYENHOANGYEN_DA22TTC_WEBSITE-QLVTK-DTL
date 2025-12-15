import { Navigate, Outlet, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useContext } from "react";
import { AuthContext } from "../core/AuthContext";

export default function ProtectedRoute({ roles }) {
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
        // Redirect về admin login và lưu lại trang hiện tại
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    try {
        const decoded = jwtDecode(token);
        const userRole = decoded.roles || decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        
        const isAdmin = userRole && (Array.isArray(userRole) ? userRole.includes("admin") : userRole === "admin");
        
        if (!isAdmin) {
            return <Navigate to="/login" replace />;
        }

        return <Outlet />;
    } catch (error) {
        console.error("Token invalid:", error);
        return <Navigate to="/login" replace />;
    }
}
