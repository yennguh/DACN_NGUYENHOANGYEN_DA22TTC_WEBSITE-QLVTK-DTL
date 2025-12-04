import { useContext, useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { fetchLoginAPI, googleLogin } from "../../api/users.api";
import Cookies from 'js-cookie';
import { AuthContext } from "../../core/AuthContext";
import { jwtDecode } from "jwt-decode";

const BACKEND_URL = process.env.REACT_APP_API_URL || "http://localhost:8017";

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onTouched" });

    const handleLoginSuccess = useCallback((accessToken, refreshToken) => {
        login(accessToken, refreshToken);
        Cookies.set("accessToken", accessToken, { expires: 7 });
        if (refreshToken) Cookies.set("refreshToken", refreshToken, { expires: 30 });
        localStorage.setItem("token", accessToken);

        let userRole = null;
        try {
            const decoded = jwtDecode(accessToken);
            userRole = decoded.roles || decoded.role || null;
        } catch (err) {}

        if (userRole && (Array.isArray(userRole) ? userRole.includes("admin") : userRole === "admin")) {
            navigate('/admin');
        } else {
            navigate('/');
        }
    }, [login, navigate]);

    // Xử lý callback từ Google OAuth redirect
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');
        const error = params.get('error');
        
        if (error) {
            alert('Đăng nhập Google thất bại: ' + error);
            window.history.replaceState({}, document.title, '/login');
            return;
        }

        if (accessToken) {
            handleLoginSuccess(accessToken, refreshToken);
            window.history.replaceState({}, document.title, '/login');
        }
    }, [location.search, handleLoginSuccess]);

    // Load Google Identity Services script
    useEffect(() => {
        // Kiểm tra nếu script đã được load
        if (document.getElementById('google-identity-script')) return;

        const script = document.createElement('script');
        script.id = 'google-identity-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        return () => {
            // Cleanup nếu cần
        };
    }, []);

    // Xử lý đăng nhập Google bằng popup
    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        
        try {
            // Sử dụng Google Identity Services với popup
            if (window.google && window.google.accounts) {
                window.google.accounts.id.initialize({
                    client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                    callback: handleGoogleCallback,
                    auto_select: false,
                    cancel_on_tap_outside: true,
                });
                
                window.google.accounts.id.prompt((notification) => {
                    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                        // Fallback to redirect flow nếu popup không hiển thị được
                        window.location.href = `${BACKEND_URL}/v1/auth/google`;
                    }
                });
            } else {
                // Fallback to redirect flow
                window.location.href = `${BACKEND_URL}/v1/auth/google`;
            }
        } catch (error) {
            console.error('Google login error:', error);
            // Fallback to redirect flow
            window.location.href = `${BACKEND_URL}/v1/auth/google`;
        }
    };

    // Callback khi Google trả về credential
    const handleGoogleCallback = async (response) => {
        try {
            if (response.credential) {
                // Gửi credential đến backend để xác thực và tạo user
                const result = await googleLogin(response.credential);
                
                if (result && result.accessToken) {
                    handleLoginSuccess(result.accessToken, result.refreshToken);
                } else {
                    alert('Đăng nhập Google thất bại. Vui lòng thử lại.');
                }
            }
        } catch (error) {
            console.error('Google callback error:', error);
            alert('Đăng nhập Google thất bại: ' + (error.message || 'Lỗi không xác định'));
        } finally {
            setGoogleLoading(false);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const res = await fetchLoginAPI({ email: data.email, password: data.password });
            const accessToken = res?.accessToken || res?.access_token || res?.data?.accessToken;
            const refreshToken = res?.refreshToken || res?.refresh_token || res?.data?.refreshToken;

            if (accessToken) {
                handleLoginSuccess(accessToken, refreshToken);
                return;
            }
            alert(res?.message || 'Tài khoản hoặc mật khẩu không đúng!');
        } catch (error) {
            alert(error?.response?.data?.message || 'Lỗi khi đăng nhập');
        } finally {
            setLoading(false);
        }
    };

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
                    <div className="flex flex-col gap-4 text-blue-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-lg">🔍</span>
                            </div>
                            <span>Tìm kiếm đồ thất lạc dễ dàng</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-lg">📢</span>
                            </div>
                            <span>Đăng tin nhanh chóng</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-lg">🤝</span>
                            </div>
                            <span>Kết nối cộng đồng sinh viên</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <img src="/logo.jpg" alt="Logo" className="w-20 h-20 mx-auto rounded-xl shadow-lg mb-4" />
                        <h2 className="text-xl font-bold text-gray-800">Đại học Trà Vinh</h2>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-800">Chào mừng trở lại!</h2>
                            <p className="text-gray-500 mt-2">Đăng nhập để tiếp tục</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        {...register("email", {
                                            required: "Email là bắt buộc",
                                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email không hợp lệ" },
                                        })}
                                        type="email"
                                        placeholder="email@example.com"
                                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-sm mt-1.5">{errors.email.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        {...register("password", { required: "Mật khẩu là bắt buộc" })}
                                        type={passwordVisible ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setPasswordVisible(!passwordVisible)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {passwordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-sm mt-1.5">{errors.password.message}</p>}
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
                                </label>
                                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Quên mật khẩu?</a>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
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
                            disabled={googleLoading}
                            className="w-full flex items-center justify-center gap-3 py-3.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-gray-700 disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            {googleLoading ? 'Đang xử lý...' : 'Đăng nhập với Google'}
                        </button>

                        <p className="text-center mt-6 text-gray-600">
                            Chưa có tài khoản?{' '}
                            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">Đăng ký ngay</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
