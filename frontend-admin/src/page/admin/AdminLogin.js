import { useContext, useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Loader2, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { fetchLoginAPI } from "../../api/users.api";
import { AuthContext } from "../../core/AuthContext";
import { jwtDecode } from "jwt-decode";

const AdminLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState(null);
    const [rememberMe, setRememberMe] = useState(false);

    const getSavedCredentials = () => {
        try {
            const saved = JSON.parse(localStorage.getItem('adminSavedCredentials') || 'null');
            if (saved) {
                return {
                    email: saved.email,
                    password: atob(saved.password)
                };
            }
        } catch (e) {
            localStorage.removeItem('adminSavedCredentials');
        }
        return null;
    };
    const savedCredentials = getSavedCredentials();

    const { register, handleSubmit, formState: { errors } } = useForm({ 
        mode: "onTouched",
        defaultValues: {
            email: savedCredentials?.email || '',
            password: savedCredentials?.password || ''
        }
    });

    useEffect(() => {
        if (savedCredentials) {
            setRememberMe(true);
        }
    }, []);

    const handleLoginSuccess = useCallback(async (accessToken, refreshToken, email = null, password = null) => {
        let userRole = null;
        try {
            const decoded = jwtDecode(accessToken);
            userRole = decoded.roles || decoded.role || null;
        } catch (err) {}

        const isAdmin = userRole && (Array.isArray(userRole) ? userRole.includes("admin") : userRole === "admin");

        if (!isAdmin) {
            setError('Tài khoản không có quyền Admin!');
            return;
        }

        if (rememberMe && email && password) {
            localStorage.setItem('adminSavedCredentials', JSON.stringify({
                email: email,
                password: btoa(password)
            }));
        } else if (!rememberMe) {
            localStorage.removeItem('adminSavedCredentials');
        }

        // Chỉ gọi login, không set cookie riêng nữa
        await login(accessToken, refreshToken);
        
        const from = location.state?.from?.pathname || '/admin';
        navigate(from, { replace: true });
    }, [login, navigate, location.state, rememberMe]);

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetchLoginAPI({ email: data.email, password: data.password });
            const accessToken = res?.accessToken || res?.access_token || res?.data?.accessToken;
            const refreshToken = res?.refreshToken || res?.refresh_token || res?.data?.refreshToken;

            if (accessToken) {
                handleLoginSuccess(accessToken, refreshToken, data.email, data.password);
                return;
            }
            setError(res?.message || 'Tài khoản hoặc mật khẩu không đúng!');
        } catch (err) {
            setError(err?.response?.data?.message || 'Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200/50">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/30">
                            <Shield className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Admin Panel</h1>
                        <p className="text-gray-500">Đăng nhập để quản trị hệ thống</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="admin-login-form" autoComplete="on">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Admin</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    {...register("email", {
                                        required: "Email là bắt buộc",
                                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email không hợp lệ" },
                                    })}
                                    type="email"
                                    name="email"
                                    id="admin-email"
                                    autoComplete="username email"
                                    placeholder="admin@tvu.edu.vn"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    {...register("password", { required: "Mật khẩu là bắt buộc" })}
                                    type={passwordVisible ? "text" : "password"}
                                    name="password"
                                    id="admin-password"
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {passwordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                        </div>

                        <div className="flex items-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                />
                                <span className="text-sm text-gray-600">Ghi nhớ mật khẩu</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                            {loading ? 'Đang xác thực...' : '🔐 Đăng nhập Admin'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">
                            Bạn là người dùng? Vui lòng truy cập trang User để đăng nhập.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-8">
                    © 2025 <span className="font-semibold text-gray-700">QLVTK-ĐTL</span> - Đại học Trà Vinh
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
