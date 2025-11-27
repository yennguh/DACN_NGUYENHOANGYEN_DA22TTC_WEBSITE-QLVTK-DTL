import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useContext } from "react";
import { AuthContext } from "../core/AuthContext";
export default function ProtectedRoute({ roles }) {
    const { token } = useContext(AuthContext);
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    try {
        const decoded = jwtDecode(token);
        const userRole = decoded.roles || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        if (userRole && !userRole.includes("admin")) {
            return <Navigate to="/" replace />;
        }

        return <Outlet />;
    } catch (error) {
        console.error("Token invalid:", error);
        return <Navigate to="/login" replace />;
    }
}
