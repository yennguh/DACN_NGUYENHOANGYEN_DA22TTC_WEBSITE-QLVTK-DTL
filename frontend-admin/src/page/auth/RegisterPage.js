import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { fetchRegisterAPI } from "../../api/users.api";

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm({ mode: "onTouched" });

    const password = watch("password", "");

    const passwordStrength = (pwd) => {
        let strength = 0;
        if (pwd.length >= 6) strength++;
        if (pwd.length >= 8) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[^A-Za-z0-9]/.test(pwd)) strength++;
        return strength;
    };

    const strength = passwordStrength(password);
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
    const strengthTexts = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const res = await fetchRegisterAPI({
                email: data.email,
                password: data.password,
                fullname: data.fullname,
                phone: data.phone,
                roles: ['user']
            });
            if (res) {
                alert('Đăng ký thành công! Vui lòng đăng nhập.');
                navigate("/login");
            }
        } catch (error) {
            alert(error?.response?.data?.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
                    <div className="w-28 h-28 bg-white rounded-2xl shadow-2xl flex items-center justify-center mb-8">
                        <img src="/logo.jpg" alt="Logo" className="w-24 h-24 rounded-xl object-cover" />
                    </div>
                    <h1 className="text-4xl font-bold text-center mb-4">Đại học Trà Vinh</h1>
                    <p className="text-xl text-purple-100 text-center mb-8">Tham gia cộng đồng ngay hôm nay</p>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-sm">
                        <h3 className="font-semibold text-lg mb-4">Lợi ích khi đăng ký:</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-purple-300" />
                                <span className="text-purple-50">Đăng tin tìm đồ thất lạc</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-purple-300" />
                                <span className="text-purple-50">Nhận thông báo khi có đồ phù hợp</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-purple-300" />
                                <span className="text-purple-50">Liên hệ trực tiếp với người đăng</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-purple-300" />
                                <span className="text-purple-50">Quản lý bài đăng cá nhân</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-6">
                        <img src="/logo.jpg" alt="Logo" className="w-20 h-20 mx-auto rounded-xl shadow-lg mb-4" />
                        <h2 className="text-xl font-bold text-gray-800">Đại học Trà Vinh</h2>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl p-8">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Tạo tài khoản mới</h2>
                            <p className="text-gray-500 mt-2">Điền thông tin để đăng ký</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        {...register("fullname", { required: "Họ tên là bắt buộc" })}
                                        type="text"
                                        placeholder="Nguyễn Văn A"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                {errors.fullname && <p className="text-red-500 text-sm mt-1">{errors.fullname.message}</p>}
                            </div>

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
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        {...register("phone", {
                                            required: "Số điện thoại là bắt buộc",
                                            pattern: { value: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ" },
                                        })}
                                        type="tel"
                                        placeholder="0912345678"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        {...register("password", { 
                                            required: "Mật khẩu là bắt buộc",
                                            minLength: { value: 6, message: "Mật khẩu tối thiểu 6 ký tự" }
                                        })}
                                        type={passwordVisible ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setPasswordVisible(!passwordVisible)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {passwordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {password && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 mb-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className={`h-1 flex-1 rounded-full ${i < strength ? strengthColors[strength - 1] : 'bg-gray-200'}`}></div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500">Độ mạnh: {strengthTexts[strength - 1] || 'Rất yếu'}</p>
                                    </div>
                                )}
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Xác nhận mật khẩu</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        {...register("confirmPassword", {
                                            required: "Xác nhận mật khẩu là bắt buộc",
                                            validate: (value) => value === password || "Mật khẩu không khớp",
                                        })}
                                        type={confirmPasswordVisible ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {confirmPasswordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={!isValid || loading}
                                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                            >
                                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                            </button>
                        </form>

                        <p className="text-center mt-6 text-gray-600">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">Đăng nhập</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
