import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Phone, Lock, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8017";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: verify, 2: reset password, 3: success
    const [error, setError] = useState(null);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [verifiedEmail, setVerifiedEmail] = useState("");

    const { register: registerStep1, handleSubmit: handleSubmitStep1, formState: { errors: errorsStep1 } } = useForm({ mode: "onTouched" });
    const { register: registerStep2, handleSubmit: handleSubmitStep2, formState: { errors: errorsStep2 }, watch } = useForm({ mode: "onTouched" });

    const newPassword = watch("newPassword");

    // Step 1: Xác thực email và số điện thoại
    const onVerify = async (data) => {
        setLoading(true);
        setError(null);

        try {
            const res = await axios.post(`${API_URL}/v1/user/verify-reset`, {
                email: data.email,
                phone: data.phone
            });

            if (res.data.success) {
                setVerifiedEmail(data.email);
                setStep(2);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Email hoặc số điện thoại không đúng!");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Đặt mật khẩu mới
    const onResetPassword = async (data) => {
        setLoading(true);
        setError(null);

        try {
            const res = await axios.post(`${API_URL}/v1/user/reset-password`, {
                email: verifiedEmail,
                newPassword: data.newPassword
            });

            if (res.data.success) {
                setStep(3);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Không thể đặt lại mật khẩu!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            {step === 3 ? (
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            ) : (
                                <Lock className="w-8 h-8 text-blue-600" />
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {step === 1 && "Quên mật khẩu?"}
                            {step === 2 && "Đặt mật khẩu mới"}
                            {step === 3 && "Thành công!"}
                        </h2>
                        <p className="text-gray-500 mt-2">
                            {step === 1 && "Nhập email và số điện thoại để xác thực"}
                            {step === 2 && "Tạo mật khẩu mới cho tài khoản của bạn"}
                            {step === 3 && "Mật khẩu đã được thay đổi thành công"}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Step 1: Verify Email & Phone */}
                    {step === 1 && (
                        <form onSubmit={handleSubmitStep1(onVerify)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        {...registerStep1("email", {
                                            required: "Email là bắt buộc",
                                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email không hợp lệ" }
                                        })}
                                        type="email"
                                        placeholder="email@example.com"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                {errorsStep1.email && <p className="text-red-500 text-sm mt-1">{errorsStep1.email.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        {...registerStep1("phone", {
                                            required: "Số điện thoại là bắt buộc",
                                            pattern: { value: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" }
                                        })}
                                        type="tel"
                                        placeholder="0123456789"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                {errorsStep1.phone && <p className="text-red-500 text-sm mt-1">{errorsStep1.phone.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                            >
                                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                {loading ? "Đang xác thực..." : "Tiếp tục"}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Reset Password */}
                    {step === 2 && (
                        <form onSubmit={handleSubmitStep2(onResetPassword)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu mới</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        {...registerStep2("newPassword", {
                                            required: "Mật khẩu mới là bắt buộc",
                                            minLength: { value: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
                                        })}
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
                                {errorsStep2.newPassword && <p className="text-red-500 text-sm mt-1">{errorsStep2.newPassword.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Xác nhận mật khẩu</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        {...registerStep2("confirmPassword", {
                                            required: "Xác nhận mật khẩu là bắt buộc",
                                            validate: value => value === newPassword || "Mật khẩu không khớp"
                                        })}
                                        type={confirmPasswordVisible ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {confirmPasswordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errorsStep2.confirmPassword && <p className="text-red-500 text-sm mt-1">{errorsStep2.confirmPassword.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                            >
                                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                            </button>
                        </form>
                    )}

                    {/* Step 3: Success */}
                    {step === 3 && (
                        <div className="text-center">
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
                                ✅ Mật khẩu của bạn đã được thay đổi thành công!
                            </div>
                            <button
                                onClick={() => navigate("/login")}
                                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30"
                            >
                                Đăng nhập ngay
                            </button>
                        </div>
                    )}

                    {/* Back to Login */}
                    {step !== 3 && (
                        <Link
                            to="/login"
                            className="flex items-center justify-center gap-2 mt-6 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại đăng nhập
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
