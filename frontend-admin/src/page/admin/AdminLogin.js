import { useContext, useState, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Loader2, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { fetchLoginAPI } from "../../api/users.api";
import Cookies from 'js-cookie';
import { AuthContext } from "../../core/AuthContext";
import { jwtDecode } from "jwt-decode";

const AdminLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState(null);
    const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onTouched" });

    const handleLoginSuccess = useCallback((accessToken, refreshToken) => {
        // Kiểm tra role admin
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

        login(accessToken, refreshToken);
        Cookies.set("accessToken", accessToken, { expires: 7 });
        if (refreshToken) Cookies.set("refreshToken", refreshToken, { expires: 30 });
        localStorage.setItem("token", accessToken);
        window.dispatchEvent(new Event('userLogin'));
        
        // Quay lại trang admin trước đó nếu có, không thì về dashboard
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
    }, [login, navigate, location.state]);

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetchLoginAPI({ email: data.email, password: data.password });
            const accessToken = res?.accessToken || res?.access_token || res?.data?.accessToken;
            const refreshToken = res?.refreshToken || res?.refresh_token || res?.data?.refreshToken;

            if (accessToken) {
                handleLoginSuccess(accessToken, refreshToken);
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30">
                            <Shield className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
                        <p className="text-gray-400">Đăng nhập để quản trị hệ thống</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Email Admin</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    {...register("email", {
                                        required: "Email là bắt buộc",
                                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email không hợp lệ" },
                                    })}
                                    type="email"
                                    placeholder="admin@tvu.edu.vn"
                                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    {...register("password", { required: "Mật khẩu là bắt buộc" })}
                                    type={passwordVisible ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {passwordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
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
                        <a href="http://localhost:3000/login" className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2">
                            <span>←</span>
                            <span>Quay lại trang đăng nhập User</span>
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-8">
                    © 2025 QLVTK-ĐTL - Đại học Trà Vinh
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
