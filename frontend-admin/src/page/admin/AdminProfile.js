import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../core/AuthContext';
import { User, Mail, Phone, Calendar, Save, Camera } from 'lucide-react';
import { updateUser, inforUser } from '../../api/users.api';
import { getImageUrl } from '../../utils/constant';
import AdminSection from './components/AdminSection';

export default function AdminProfile() {
    const { user, setUserInfo } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        phone: '',
        avatar: null
    });
    const [previewAvatar, setPreviewAvatar] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                fullname: user.fullname || '',
                email: user.email || '',
                phone: user.phone || '',
                avatar: null
            });
            setPreviewAvatar(user.avatar ? getImageUrl(user.avatar) : null);
        }
    }, [user]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, avatar: file }));
            setPreviewAvatar(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = new FormData();
            data.append('fullname', formData.fullname);
            data.append('phone', formData.phone || '');
            if (formData.avatar) {
                data.append('avatar', formData.avatar);
            }

            await updateUser(data);
            const updatedUser = await inforUser();
            setUserInfo(updatedUser);
            alert('Cập nhật thông tin thành công!');
        } catch (error) {
            alert('Lỗi: ' + (error.message || 'Không thể cập nhật'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminSection title="Thông tin cá nhân">
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </AdminSection>
        );
    }

    return (
        <AdminSection title="Thông tin cá nhân">
            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar */}
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                                {previewAvatar ? (
                                    <img src={previewAvatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
                                        {user?.fullname?.charAt(0) || 'A'}
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                                <Camera className="w-5 h-5 text-white" />
                                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                            </label>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Nhấn vào biểu tượng camera để thay đổi ảnh</p>
                    </div>

                    {/* Form fields */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <User className="w-4 h-4" />
                                Họ và tên
                            </label>
                            <input
                                type="text"
                                value={formData.fullname}
                                onChange={(e) => handleChange('fullname', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Nhập họ và tên"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Mail className="w-4 h-4" />
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi</p>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Phone className="w-4 h-4" />
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Nhập số điện thoại"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="w-4 h-4" />
                                Ngày tạo tài khoản
                            </label>
                            <input
                                type="text"
                                value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                disabled
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </form>
            </div>
        </AdminSection>
    );
}
