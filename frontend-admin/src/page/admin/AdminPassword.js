import { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { Lock, Eye, EyeOff, Shield, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import { changePassword } from '../../api/users.api';
import { AuthContext } from '../../core/AuthContext';

export default function AdminPassword() {
    const { user } = useContext(AuthContext);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
        mode: 'onTouched'
    });

    const newPassword = watch('newPassword');

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });
            setSuccess(true);
            reset();
            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu');
        } finally {
            setLoading(false);
        }
    };

    // Password strength checker
    const getPasswordStrength = (password) => {
        if (!password) return { score: 0, label: '', color: '' };
        let score = 0;
        if (password.length >= 6) score++;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

        if (score <= 1) return { score: 1, label: 'Yếu', color: 'bg-red-500' };
        if (score <= 2) return { score: 2, label: 'Trung bình', color: 'bg-yellow-500' };
        if (score <= 3) return { score: 3, label: 'Khá', color: 'bg-blue-500' };
        if (score <= 4) return { score: 4, label: 'Mạnh', color: 'bg-green-500' };
        return { score: 5, label: 'Rất mạnh', color: 'bg-emerald-500' };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                        <KeyRound className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Đổi mật khẩu</h1>
                        <p className="text-gray-500">Thiết lập mật khẩu mới cho tài khoản quản trị</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto">
                {/* User Info Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{user?.fullname || 'Admin'}</h3>
                            <p className="text-gray-500">{user?.email}</p>
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mt-1">
                                <Shield className="w-3 h-3" />
                                Quản trị viên
                            </span>
                        </div>
                    </div>
                </div>

                {/* Password Form */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Lock className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-gray-800">Thay đổi mật khẩu</h3>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
                            <CheckCircle className="w-5 h-5" />
                            <span>Đổi mật khẩu thành công!</span>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Mật khẩu hiện tại
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    {...register('currentPassword', {
                                        required: 'Vui lòng nhập mật khẩu hiện tại'
                                    })}
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    placeholder="Nhập mật khẩu hiện tại"
                                    className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.currentPassword && (
                                <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>
                            )}
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Mật khẩu mới
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    {...register('newPassword', {
                                        required: 'Vui lòng nhập mật khẩu mới',
                                        minLength: {
                                            value: 6,
                                            message: 'Mật khẩu phải có ít nhất 6 ký tự'
                                        }
                                    })}
                                    type={showNewPassword ? 'text' : 'password'}
                                    placeholder="Nhập mật khẩu mới"
                                    className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.newPassword && (
                                <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
                            )}

                            {/* Password Strength */}
                            {newPassword && (
                                <div className="mt-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-500">Độ mạnh mật khẩu</span>
                                        <span className={`text-xs font-semibold ${
                                            passwordStrength.score <= 1 ? 'text-red-500' :
                                            passwordStrength.score <= 2 ? 'text-yellow-500' :
                                            passwordStrength.score <= 3 ? 'text-blue-500' : 'text-green-500'
                                        }`}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-1.5 flex-1 rounded-full transition-all ${
                                                    level <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200'
                                                }`}
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Xác nhận mật khẩu mới
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    {...register('confirmPassword', {
                                        required: 'Vui lòng xác nhận mật khẩu mới',
                                        validate: value => value === newPassword || 'Mật khẩu xác nhận không khớp'
                                    })}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Nhập lại mật khẩu mới"
                                    className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Tips */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                            <h4 className="font-semibold text-blue-800 mb-2">💡 Gợi ý tạo mật khẩu mạnh:</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Ít nhất 8 ký tự</li>
                                <li>• Kết hợp chữ hoa và chữ thường</li>
                                <li>• Có ít nhất 1 số</li>
                                <li>• Có ít nhất 1 ký tự đặc biệt (!@#$%...)</li>
                            </ul>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <KeyRound className="w-5 h-5" />
                                    Đổi mật khẩu
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Security Note */}
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-amber-800">Lưu ý bảo mật</h4>
                            <p className="text-sm text-amber-700 mt-1">
                                Sau khi đổi mật khẩu, bạn sẽ cần đăng nhập lại trên các thiết bị khác. 
                                Không chia sẻ mật khẩu với bất kỳ ai.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
