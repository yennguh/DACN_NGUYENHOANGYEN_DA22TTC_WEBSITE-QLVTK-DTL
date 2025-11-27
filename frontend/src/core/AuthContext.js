import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { inforUser } from "../api/users.api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(Cookies.get("accessToken") || null);
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(false);

    const fetchCurrentUser = async () => {
        if (!Cookies.get("accessToken")) {
            setUser(null);
            return null;
        }
        setLoadingUser(true);
        try {
            const userData = await inforUser();
            setUser(userData || null);
            return userData || null;
        } catch (error) {
            console.error("Không thể lấy thông tin người dùng:", error);
            setUser(null);
            return null;
        } finally {
            setLoadingUser(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchCurrentUser();
        } else {
            setUser(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const login = async (accessToken, refreshToken) => {
        Cookies.set("accessToken", accessToken);
        if (refreshToken) Cookies.set("refreshToken", refreshToken);
        setToken(accessToken);
        await fetchCurrentUser();
    };

    const logout = () => {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        setToken(null);
        setUser(null);
    };

    const setUserInfo = (userData) => {
        setUser(userData);
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
