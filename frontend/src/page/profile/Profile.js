import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Save, Edit2, Camera, X } from 'lucide-react';
import { inforUser, updateUser } from '../../api/users.api';
import { AuthContext } from '../../core/AuthContext';
import { getImageUrl } from '../../utils/constant';

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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Đang tải...</div>
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
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Hồ sơ cá nhân</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {success}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div className="relative">
                                {avatarPreview ? (
                                    <img 
                                        src={avatarPreview} 
                                        alt="Avatar" 
                                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                                        onError={(e) => {
                                            try {
                                                // Fallback nếu ảnh không load được
                                                if (e && e.target) {
                                                    if (e.target.style) e.target.style.display = 'none';
                                                    const next = e.target.nextElementSibling;
                                                    if (next && next.style) next.style.display = 'flex';
                                                }
                                            } catch (err) {
                                                // swallow errors to avoid breaking the app
                                                // log for debugging
                                                // console.warn('Avatar onError handler failed', err);
                                            }
                                        }}
                                    />
                                ) : null}
                                {!avatarPreview && (
                                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-2 border-gray-200">
                                        <User className="w-10 h-10 text-blue-600" />
                                    </div>
                                )}
                                {isEditing && (
                                    <div className="absolute -bottom-1 -right-1">
                                        <label className="cursor-pointer">
                                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition">
                                                <Camera className="w-4 h-4 text-white" />
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
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{user.fullname}</h2>
                                <p className="text-gray-600">{user.email}</p>
                            </div>
                        </div>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <User className="w-4 h-4 inline mr-2" />
                                Họ và tên
                            </label>
                            {isEditing ? (
                                <>
                                    <input
                                        {...register("fullname", { required: "Họ tên là bắt buộc" })}
                                        type="text"
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    {errors.fullname && (
                                        <p className="text-red-500 text-sm mt-1">{errors.fullname.message}</p>
                                    )}
                                </>
                            ) : (
                                <p className="text-gray-800 p-3 bg-gray-50 rounded-lg">{user.fullname}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Mail className="w-4 h-4 inline mr-2" />
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
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                                    )}
                                </>
                            ) : (
                                <p className="text-gray-800 p-3 bg-gray-50 rounded-lg">{user.email}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Phone className="w-4 h-4 inline mr-2" />
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
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    {errors.phone && (
                                        <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                                    )}
                                </>
                            ) : (
                                <p className="text-gray-800 p-3 bg-gray-50 rounded-lg">{user.phone || 'Chưa cập nhật'}</p>
                            )}
                        </div>

                        {/* Action buttons */}
                        {isEditing && (
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;

