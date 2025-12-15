import { useState, useEffect } from 'react';
import AdminSection from './components/AdminSection';
import { Building2, Mail, Phone, MapPin, Globe, Clock, Save, Edit2, X } from 'lucide-react';
import { getSettings, updateSettings } from '../../api/settings.api';
import logoSchool from '../../public/assets/logo.jpg';

export default function SettingsSchool() {
    const [schoolInfo, setSchoolInfo] = useState({
        name: '',
        nameEn: '',
        shortName: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        workingHours: '',
        description: ''
    });
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editData, setEditData] = useState({});

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await getSettings('school');
            if (data) {
                setSchoolInfo(data);
            } else {
                // Dữ liệu mặc định nếu chưa có trong DB
                setSchoolInfo({
                    name: 'Đại học Trà Vinh',
                    nameEn: 'Tra Vinh University',
                    shortName: 'TVU',
                    address: '126 Nguyễn Thiện Thành, Phường 5, TP. Trà Vinh',
                    phone: '0986 095 484',
                    email: 'hoangyen24042004@gmail.com',
                    website: 'https://tvu.edu.vn',
                    workingHours: 'Thứ 2 - Thứ 6: 7:00 - 17:00',
                    description: 'Hệ thống tìm đồ thất lạc Đại học Trà Vinh'
                });
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setEditData({ ...schoolInfo });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData({});
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSettings('school', editData);
            setSchoolInfo(editData);
            setIsEditing(false);
            alert('Cập nhật thành công!');
        } catch (error) {
            alert('Lỗi khi cập nhật: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <AdminSection title="Thông tin trường">
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </AdminSection>
        );
    }

    return (
        <AdminSection title="Thông tin trường">
            <div className="space-y-6">
                {/* Nút chỉnh sửa */}
                <div className="flex justify-end">
                    {!isEditing ? (
                        <button
                            onClick={handleEdit}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                            Chỉnh sửa
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Logo và tên trường */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
                            <img src={logoSchool} alt="Logo trường" className="w-full h-full object-cover rounded-full" />
                        </div>
                        <div className="text-center md:text-left flex-1">
                            {isEditing ? (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={editData.name || ''}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        className="w-full text-2xl font-bold bg-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50"
                                        placeholder="Tên trường"
                                    />
                                    <input
                                        type="text"
                                        value={editData.nameEn || ''}
                                        onChange={(e) => handleChange('nameEn', e.target.value)}
                                        className="w-full bg-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50"
                                        placeholder="Tên tiếng Anh"
                                    />
                                    <input
                                        type="text"
                                        value={editData.shortName || ''}
                                        onChange={(e) => handleChange('shortName', e.target.value)}
                                        className="w-32 bg-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50"
                                        placeholder="Tên viết tắt"
                                    />
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-3xl font-bold">{schoolInfo.name}</h2>
                                    <p className="text-blue-200 text-lg mt-1">{schoolInfo.nameEn}</p>
                                    <span className="inline-block mt-3 px-4 py-1 bg-white/20 rounded-full text-sm font-medium">
                                        {schoolInfo.shortName}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Thông tin chi tiết */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Thông tin liên hệ */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800 text-lg">Thông tin liên hệ</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <InfoRow icon={MapPin} label="Địa chỉ" field="address" value={isEditing ? editData.address : schoolInfo.address} isEditing={isEditing} onChange={handleChange} />
                            <InfoRow icon={Phone} label="Điện thoại" field="phone" value={isEditing ? editData.phone : schoolInfo.phone} isEditing={isEditing} onChange={handleChange} />
                            <InfoRow icon={Mail} label="Email" field="email" value={isEditing ? editData.email : schoolInfo.email} isEditing={isEditing} onChange={handleChange} />
                            <InfoRow icon={Globe} label="Website" field="website" value={isEditing ? editData.website : schoolInfo.website} isEditing={isEditing} onChange={handleChange} isLink={!isEditing} />
                            <InfoRow icon={Clock} label="Giờ làm việc" field="workingHours" value={isEditing ? editData.workingHours : schoolInfo.workingHours} isEditing={isEditing} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Giới thiệu */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800 text-lg">Giới thiệu</h3>
                        </div>
                        
                        {isEditing ? (
                            <textarea
                                value={editData.description || ''}
                                onChange={(e) => handleChange('description', e.target.value)}
                                rows={5}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Mô tả về hệ thống..."
                            />
                        ) : (
                            <p className="text-gray-600 leading-relaxed">{schoolInfo.description}</p>
                        )}
                        
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-2">Hệ thống tìm đồ thất lạc</h4>
                            <p className="text-sm text-blue-600">
                                Kênh thông tin tra cứu đồ bị mất của sinh viên Đại học Trà Vinh.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminSection>
    );
}

// Component hiển thị 1 dòng thông tin
function InfoRow({ icon: Icon, label, field, value, isEditing, onChange, isLink }) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
                <p className="text-sm text-gray-500">{label}</p>
                {isEditing ? (
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(field, e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                ) : isLink ? (
                    <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {value}
                    </a>
                ) : (
                    <p className="text-gray-800">{value}</p>
                )}
            </div>
        </div>
    );
}
