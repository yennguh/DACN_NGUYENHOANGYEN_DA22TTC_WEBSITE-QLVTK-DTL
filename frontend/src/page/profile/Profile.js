import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Save, Edit2, Camera, X } from 'lucide-react';
import { inforUser, updateUser } from '../../api/users.api';
import { AuthContext } from '../../core/AuthContext';
import { getImageUrl } from '../../utils/constant';
import { ProfileSkeleton } from '../../core/LoadingSpinner';

const Profile = () => {
    const navigate = useNavigate();
    const { token, setUserInfo, refreshUser } = useContext(AuthContext);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const fileInputRef = useRef(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        mode: "onTouched"
    });

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        fetchUserInfo();
    }, [token, navigate]);

    const fetchUserInfo = async () => {
        try {
            const userData = await inforUser();
            if (userData) {
                setUser(userData);
                setUserInfo(userData);
                reset(userData);
                // Set avatar preview nếu có
                if (userData.avatar) {
                    setAvatarPreview(getImageUrl(userData.avatar));
                }
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Vui lòng chọn file ảnh');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Kích thước ảnh không được vượt quá 5MB');
                return;
            }
            setAvatarFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handleRemoveAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview(user?.avatar ? getImageUrl(user.avatar) : null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const onSubmit = async (data) => {
        setError('');
        setSuccess('');

        try {
            // Tạo FormData nếu có avatar file
            let payload;
            if (avatarFile) {
                payload = new FormData();
                payload.append('fullname', data.fullname);
                payload.append('email', data.email);
                if (data.phone) payload.append('phone', data.phone);
                payload.append('avatar', avatarFile);
            } else {
                payload = {
                    fullname: data.fullname,
                    email: data.email,
                    phone: data.phone || ''
                };
            }

            const result = await updateUser(payload);
            console.log('Update result:', result); // Debug log
            
            // Luôn fetch lại từ database để đảm bảo có dữ liệu mới nhất (bao gồm avatar)
            const fetched = await refreshUser();
            if (fetched) {
                console.log('Fetched user after update:', fetched); // Debug log
                setUser(fetched);
                reset(fetched);
                setUserInfo(fetched);
                // Update avatar preview từ database
                if (fetched.avatar) {
                    setAvatarPreview(getImageUrl(fetched.avatar));
                } else {
                    setAvatarPreview(null);
                }
            } else {
                // Fallback: dùng data từ response nếu có
                const updatedUser = result?.data || result?.user || result;
                if (updatedUser) {
                    setUser(updatedUser);
                    reset(updatedUser);
                    setUserInfo(updatedUser);
                    if (updatedUser.avatar) {
                        setAvatarPreview(getImageUrl(updatedUser.avatar));
                    }
                } else {
                    // Cuối cùng: fetch lại từ API
                    await fetchUserInfo();
                }
            }
            setAvatarFile(null);
            setSuccess(result?.message || 'Cập nhật thông tin thành công!');
            setIsEditing(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-10 px-4">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8 text-gray-800">Hồ sơ cá nhân</h1>
                    <ProfileSkeleton />
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Không tìm thấy thông tin người dùng</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-10 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">Hồ sơ cá nhân</h1>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-xl mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <X className="w-4 h-4 text-red-500" />
                        </div>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-5 py-4 rounded-xl mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Save className="w-4 h-4 text-emerald-500" />
                        </div>
                        {success}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header với gradient */}
                    <div className="bg-gradient-to-r from-blue-500 to-violet-500 h-24"></div>
                    
                    <div className="px-8 pb-8">
                        {/* Avatar và info */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-12 mb-8">
                            <div className="flex flex-col sm:flex-row items-center gap-5">
                                {/* Avatar */}
                                <div className="relative">
                                    {avatarPreview ? (
                                        <img 
                                            src={avatarPreview} 
                                            alt="Avatar" 
                                            className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-lg"
                                            onError={(e) => {
                                                try {
                                                    if (e && e.target) {
                                                        if (e.target.style) e.target.style.display = 'none';
                                                        const next = e.target.nextElementSibling;
                                                        if (next && next.style) next.style.display = 'flex';
                                                    }
                                                } catch (err) {}
                                            }}
                                        />
                                    ) : null}
                                    {!avatarPreview && (
                                        <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center border-4 border-white shadow-lg">
                                            <User className="w-12 h-12 text-blue-500" />
                                        </div>
                                    )}
                                    {isEditing && (
                                        <div className="absolute -bottom-2 -right-2">
                                            <label className="cursor-pointer">
                                                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center hover:bg-blue-600 transition shadow-lg">
                                                    <Camera className="w-5 h-5 text-white" />
                                                </div>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleAvatarChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    )}
                                </div>
                                <div className="text-center sm:text-left mt-4 sm:mt-8">
                                    <h2 className="text-2xl font-bold text-gray-800">{user.fullname}</h2>
                                    <p className="text-gray-500">{user.email}</p>
                                </div>
                            </div>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="mt-4 sm:mt-0 flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-sm"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Chỉnh sửa
                                </button>
                            )}
                        </div>

                    {/* Avatar upload section khi editing */}
                    {isEditing && avatarFile && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img 
                                        src={avatarPreview} 
                                        alt="Preview" 
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Ảnh đại diện mới</p>
                                        <p className="text-xs text-gray-500">{avatarFile.name}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveAvatar}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Full Name */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                                <User className="w-4 h-4 text-blue-500" />
                                Họ và tên
                            </label>
                            {isEditing ? (
                                <>
                                    <input
                                        {...register("fullname", { required: "Họ tên là bắt buộc" })}
                                        type="text"
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                    {errors.fullname && (
                                        <p className="text-red-500 text-sm mt-2">{errors.fullname.message}</p>
                                    )}
                                </>
                            ) : (
                                <p className="text-gray-800 p-4 bg-gray-50 rounded-xl border border-gray-100">{user.fullname}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                                <Mail className="w-4 h-4 text-blue-500" />
                                Email
                            </label>
                            {isEditing ? (
                                <>
                                    <input
                                        {...register("email", {
                                            required: "Email là bắt buộc",
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: "Email không hợp lệ"
                                            }
                                        })}
                                        type="email"
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm mt-2">{errors.email.message}</p>
                                    )}
                                </>
                            ) : (
                                <p className="text-gray-800 p-4 bg-gray-50 rounded-xl border border-gray-100">{user.email}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                                <Phone className="w-4 h-4 text-blue-500" />
                                Số điện thoại
                            </label>
                            {isEditing ? (
                                <>
                                    <input
                                        {...register("phone", {
                                            pattern: {
                                                value: /^[0-9]{10}$/,
                                                message: "Số điện thoại không hợp lệ"
                                            }
                                        })}
                                        type="tel"
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                    {errors.phone && (
                                        <p className="text-red-500 text-sm mt-2">{errors.phone.message}</p>
                                    )}
                                </>
                            ) : (
                                <p className="text-gray-800 p-4 bg-gray-50 rounded-xl border border-gray-100">{user.phone || 'Chưa cập nhật'}</p>
                            )}
                        </div>

                        {/* Action buttons */}
                        {isEditing && (
                            <div className="flex gap-4 pt-6">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-sm"
                                >
                                    <Save className="w-4 h-4" />
                                    Lưu thay đổi
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        reset(user);
                                        setError('');
                                        setSuccess('');
                                        setAvatarFile(null);
                                        setAvatarPreview(user?.avatar ? getImageUrl(user.avatar) : null);
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                    }}
                                    className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                            </div>
                        )}
                    </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

