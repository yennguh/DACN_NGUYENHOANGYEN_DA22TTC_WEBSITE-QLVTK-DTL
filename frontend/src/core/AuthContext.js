import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { inforUser } from "../api/users.api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => Cookies.get("accessToken") || null);
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem("currentUser");
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });
    const [loadingUser, setLoadingUser] = useState(false);

    const fetchCurrentUser = async () => {
        const currentToken = Cookies.get("accessToken");
        if (!currentToken) {
            return null;
        }
        setLoadingUser(true);
        try {
            const userData = await inforUser();
            if (userData) {
                setUser(userData);
                localStorage.setItem("currentUser", JSON.stringify(userData));
                return userData;
            }
            return null;
        } catch (error) {
            console.error("Không thể lấy thông tin người dùng:", error);
            // Nếu lỗi 401, xóa token và user
            if (error.response?.status === 401) {
                Cookies.remove("accessToken");
                Cookies.remove("refreshToken");
                localStorage.removeItem("currentUser");
                setToken(null);
                setUser(null);
            }
            return null;
        } finally {
            setLoadingUser(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchCurrentUser();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const login = async (accessToken, refreshToken) => {
        Cookies.set("accessToken", accessToken, { expires: 7 });
        if (refreshToken) {
            Cookies.set("refreshToken", refreshToken, { expires: 30 });
        }
        setToken(accessToken);
        // Fetch user sau khi set token
        const userData = await inforUser();
        if (userData) {
            setUser(userData);
            localStorage.setItem("currentUser", JSON.stringify(userData));
        }
    };

    const logout = () => {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        localStorage.removeItem("currentUser");
        setToken(null);
        setUser(null);
    };

    const setUserInfo = (userData) => {
        setUser(userData);
        if (userData) {
            localStorage.setItem("currentUser", JSON.stringify(userData));
        }
    };

    return (
        <AuthContext.Provider value={{
            token,
            user,
            login,
            logout,
            setUserInfo,
            refreshUser: fetchCurrentUser,
            loadingUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};
