import { useContext, useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Loader2, CheckCircle, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import { fetchLoginAPI } from "../../api/users.api";
import Cookies from 'js-cookie';
import { AuthContext } from "../../core/AuthContext";
import { jwtDecode } from "jwt-decode";

const BACKEND_URL = process.env.REACT_APP_API_URL || "http://localhost:8017";

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState(null);
    const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onTouched" });

    const handleLoginSuccess = useCallback((accessToken, refreshToken) => {
        login(accessToken, refreshToken);
        Cookies.set("accessToken", accessToken, { expires: 7 });
        if (refreshToken) Cookies.set("refreshToken", refreshToken, { expires: 30 });
        localStorage.setItem("token", accessToken);
        window.dispatchEvent(new Event('userLogin'));
        
        // Quay lại trang trước đó nếu có, không thì về trang chủ
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
    }, [login, navigate, location.state]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');
        const errorParam = params.get('error');
        
        if (errorParam) {
            setError('Đăng nhập Google thất bại: ' + errorParam);
            window.history.replaceState({}, document.title, '/login');
            return;
        }

        if (accessToken) {
            handleLoginSuccess(accessToken, refreshToken);
            window.history.replaceState({}, document.title, '/login');
        }
    }, [location.search, handleLoginSuccess]);

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetchLoginAPI({ email: data.email, password: data.password });
            const accessToken = res?.accessToken || res?.access_token || res?.data?.accessToken;
            const refreshToken = res?.refreshToken || res?.refresh_token || res?.data?.refreshToken;

            if (accessToken) {
                // Kiểm tra nếu là admin thì không cho đăng nhập ở trang user
                let userRole = null;
                try {
                    const decoded = jwtDecode(accessToken);
                    userRole = decoded.roles || decoded.role || null;
                } catch (err) {}

                const isAdmin = userRole && (Array.isArray(userRole) ? userRole.includes("admin") : userRole === "admin");
                
                if (isAdmin) {
                    setError('Tài khoản Admin vui lòng đăng nhập tại trang Admin!');
                    return;
                }

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

    const handleGoogleLogin = () => {
        setGoogleLoading(true);
        window.location.href = `${BACKEND_URL}/v1/auth/google`;
    };

    const quickLinks = [
        { title: "Trang chủ TVU", url: "https://tvu.edu.vn", icon: "🏫" },
        { title: "Cổng sinh viên", url: "https://sinhvien.tvu.edu.vn", icon: "🎓" },
        { title: "E-Learning", url: "https://elearning.tvu.edu.vn", icon: "📚" }
    ];

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
                    <div className="w-28 h-28 bg-white rounded-2xl shadow-2xl flex items-center justify-center mb-8">
                        <img src="/logo.jpg" alt="Logo" className="w-24 h-24 rounded-xl object-cover" />
                    </div>
                    <h1 className="text-4xl font-bold text-center mb-4">Đại học Trà Vinh</h1>
                    <p className="text-xl text-blue-100 text-center mb-8">Hệ thống quản lý vật thất lạc</p>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-sm mb-8">
                        <h3 className="font-semibold text-lg mb-4">Tính năng nổi bật:</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-300" />
                                <span className="text-blue-50">Tìm kiếm đồ thất lạc dễ dàng</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-300" />
                                <span className="text-blue-50">Đăng tin nhanh chóng</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-300" />
                                <span className="text-blue-50">Nhận thông báo realtime</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-300" />
                                <span className="text-blue-50">Kết nối cộng đồng sinh viên</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="w-full max-w-sm">
                        <h3 className="text-sm font-semibold text-blue-200 uppercase tracking-wider mb-4 text-center">
                            Liên kết nhanh
                        </h3>
                        <div className="space-y-2">
                            {quickLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 transition-all group"
                                >
                                    <span className="text-xl">{link.icon}</span>
                                    <span className="flex-1 font-medium">{link.title}</span>
                                    <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-6">
                        <img src="/logo.jpg" alt="Logo" className="w-20 h-20 mx-auto rounded-xl shadow-lg mb-4" />
                        <h2 className="text-xl font-bold text-gray-800">Đại học Trà Vinh</h2>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl p-8">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Chào mừng trở lại!</h2>
                            <p className="text-gray-500 mt-2">Đăng nhập để tiếp tục</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
                                ⚠️ {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        {...register("email", {
                                            required: "Email là bắt buộc",
                                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email không hợp lệ" },
                                        })}
                                        type="email"
                                        placeholder="email@example.com"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        {...register("password", { required: "Mật khẩu là bắt buộc" })}
                                        type={passwordVisible ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setPasswordVisible(!passwordVisible)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {passwordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
                                </label>
                                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                    Quên mật khẩu?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                            >
                                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 bg-white text-sm text-gray-500">hoặc</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={googleLoading || loading}
                            className="w-full flex items-center justify-center gap-3 py-3.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-gray-700 disabled:opacity-50"
                        >
                            {googleLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                            )}
                            {googleLoading ? 'Đang chuyển hướng...' : 'Đăng nhập với Google'}
                        </button>

                        <p className="text-center mt-6 text-gray-600">
                            Chưa có tài khoản?{' '}
                            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">Đăng ký ngay</Link>
                        </p>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <Link 
                                to="/admin/login" 
                                className="flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
                            >
                                <span>🛡️</span>
                                <span>Đăng nhập với tư cách Admin</span>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Quick Links */}
                    <div className="lg:hidden mt-6">
                        <div className="grid grid-cols-3 gap-3">
                            {quickLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center gap-2 bg-white rounded-xl p-3 shadow-md hover:shadow-lg transition-all"
                                >
                                    <span className="text-2xl">{link.icon}</span>
                                    <span className="text-xs font-medium text-gray-700 text-center">{link.title}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
