import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, MapPin, FileText, Image, Save, X, Plus, ArrowLeft, User } from 'lucide-react';
import { fetchPostById, updatePost } from '../../api/posts.api';
import { AuthContext } from '../../core/AuthContext';
import { getImageUrl } from '../../utils/constant';
import AdminSection from './components/AdminSection';

export default function AdminPostEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [post, setPost] = useState(null);
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'found',
        itemType: '',
        customItemType: '',
        location: '',
        customLocation: '',
        contactPhone: '',
        contactEmail: '',
        status: 'approved'
    });

    // Thông tin người đăng (chỉ hiển thị, không cho sửa)
    const [authorInfo, setAuthorInfo] = useState({
        fullname: '',
        avatar: '',
        userId: ''
    });

    const locations = [
        'Thư viện', 'Căn tin', 'Nhà xe', 'Sân trường',
        'Phòng học A', 'Phòng học B', 'Phòng học C', 'Phòng học D',
        'Nhà thi đấu', 'Ký túc xá', 'Cổng trường', 'Khác'
    ];

    const itemTypes = [
        'Điện thoại', 'Ví/Bóp', 'Chìa khóa', 'Thẻ sinh viên',
        'Laptop', 'Tai nghe', 'Sách vở', 'Quần áo',
        'Túi xách', 'Đồng hồ', 'Kính mắt', 'Khác'
    ];

    const statusOptions = [
        { value: 'pending', label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700' },
        { value: 'approved', label: 'Đã duyệt', color: 'bg-green-100 text-green-700' },
        { value: 'rejected', label: 'Từ chối', color: 'bg-red-100 text-red-700' },
        { value: 'completed', label: 'Hoàn thành', color: 'bg-purple-100 text-purple-700' }
    ];


    // Check if location/itemType is custom (not in predefined list)
    const isCustomLocation = formData.location === 'Khác' || 
        (formData.location && !locations.includes(formData.location) && formData.location !== '');
    const isCustomItemType = formData.itemType === 'Khác' || 
        (formData.itemType && !itemTypes.includes(formData.itemType) && formData.itemType !== '');

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        const loadPost = async () => {
            try {
                const data = await fetchPostById(id);
                if (data) {
                    setPost(data);
                    
                    // Xác định location và itemType
                    const locationInList = locations.includes(data.location);
                    const itemTypeInList = itemTypes.includes(data.itemType);

                    setFormData({
                        title: data.title || '',
                        description: data.description || '',
                        category: data.category || 'found',
                        itemType: itemTypeInList ? data.itemType : 'Khác',
                        customItemType: itemTypeInList ? '' : data.itemType,
                        location: locationInList ? data.location : 'Khác',
                        customLocation: locationInList ? '' : data.location,
                        contactPhone: data.contactInfo?.phone || '',
                        contactEmail: data.contactInfo?.email || '',
                        status: data.status || 'approved'
                    });

                    // Lưu thông tin người đăng
                    setAuthorInfo({
                        fullname: data.authorFullname || data.user?.fullname || 'Không xác định',
                        avatar: data.authorAvatar || data.user?.avatar || '',
                        userId: data.userId || ''
                    });

                    // Lưu ảnh hiện có
                    if (data.images && data.images.length > 0) {
                        setExistingImages(data.images);
                    }
                }
            } catch (error) {
                console.error('Error loading post:', error);
                alert('Không thể tải bài đăng');
                navigate('/admin');
            } finally {
                setLoading(false);
            }
        };

        loadPost();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = existingImages.length + newImages.length + files.length;
        
        if (totalImages > 5) {
            alert('Chỉ được tải tối đa 5 ảnh');
            return;
        }

        // Convert files to base64
        files.forEach(file => {
            if (file.size > 2 * 1024 * 1024) {
                alert('Mỗi ảnh tối đa 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImages(prev => [...prev, reader.result]); // Lưu base64
                setPreviewImages(prev => [...prev, reader.result]); // Preview cũng dùng base64
            };
            reader.readAsDataURL(file);
        });
    };

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const finalItemType = formData.itemType === 'Khác' ? formData.customItemType : formData.itemType;
        const finalLocation = formData.location === 'Khác' ? formData.customLocation : formData.location;

        if (!formData.title || !finalItemType || !finalLocation) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        setSaving(true);
        try {
            // Chuẩn bị payload - KHÔNG thay đổi userId, authorFullname, authorAvatar
            // Kết hợp ảnh cũ (đã lọc blob URL) và ảnh mới (base64)
            const validExistingImages = existingImages.filter(img => 
                img && !img.startsWith('blob:') // Loại bỏ blob URL không hợp lệ
            );
            const allImages = [...validExistingImages, ...newImages];
            
            const payload = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                itemType: finalItemType,
                location: finalLocation,
                status: formData.status,
                contactInfo: {
                    phone: formData.contactPhone,
                    email: formData.contactEmail
                },
                images: allImages // Kết hợp ảnh cũ hợp lệ và ảnh mới
            };

            await updatePost(id, payload);
            alert('Cập nhật bài đăng thành công!');
            navigate(`/admin/posts/${id}`);
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminSection title="Chỉnh sửa bài đăng">
                <div className="flex items-center justify-center py-12">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </AdminSection>
        );
    }

    if (!post) {
        return (
            <AdminSection title="Chỉnh sửa bài đăng">
                <div className="text-center py-12">
                    <p className="text-gray-500">Không tìm thấy bài đăng</p>
                    <button onClick={() => navigate('/admin')} className="mt-4 text-blue-600 hover:underline">
                        Quay về Dashboard
                    </button>
                </div>
            </AdminSection>
        );
    }


    return (
        <AdminSection title="Chỉnh sửa bài đăng">
            <div className="w-full">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Quay lại
                </button>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Thông tin người đăng - CHỈ HIỂN THỊ, KHÔNG CHO SỬA */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-500" />
                            Thông tin người đăng (không thể thay đổi)
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden">
                                {authorInfo.avatar ? (
                                    <img
                                        src={getImageUrl(authorInfo.avatar)}
                                        alt={authorInfo.fullname}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <span className="text-white font-bold text-xl">
                                        {authorInfo.fullname?.substring(0, 1).toUpperCase() || 'U'}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800 text-lg">{authorInfo.fullname}</p>
                                <p className="text-sm text-gray-500">ID: {authorInfo.userId}</p>
                            </div>
                        </div>
                    </div>

                    {/* Trạng thái */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-4">Trạng thái bài đăng</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {statusOptions.map(option => (
                                <label
                                    key={option.value}
                                    className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                        formData.status === option.value
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="status"
                                        value={option.value}
                                        checked={formData.status === option.value}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${option.color}`}>
                                        {option.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Loại tin */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-blue-500" />
                            Loại tin đăng
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                formData.category === 'found' 
                                    ? 'border-green-500 bg-green-50 text-green-700' 
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}>
                                <input
                                    type="radio"
                                    name="category"
                                    value="found"
                                    checked={formData.category === 'found'}
                                    onChange={handleChange}
                                    className="hidden"
                                />
                                <span className="text-2xl">✨</span>
                                <span className="font-medium">Đồ nhặt được</span>
                            </label>
                            <label className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                formData.category === 'lost' 
                                    ? 'border-red-500 bg-red-50 text-red-700' 
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}>
                                <input
                                    type="radio"
                                    name="category"
                                    value="lost"
                                    checked={formData.category === 'lost'}
                                    onChange={handleChange}
                                    className="hidden"
                                />
                                <span className="text-2xl">🔍</span>
                                <span className="font-medium">Đồ bị mất</span>
                            </label>
                        </div>
                    </div>


                    {/* Thông tin cơ bản */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" />
                            Thông tin cơ bản
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tiêu đề <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="VD: Nhặt được ví màu đen tại thư viện"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả chi tiết
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Mô tả đặc điểm nhận dạng, thời gian, địa điểm cụ thể..."
                                    rows={4}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Loại đồ vật <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="itemType"
                                        value={isCustomItemType && formData.itemType !== 'Khác' ? 'Khác' : formData.itemType}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    >
                                        <option value="">-- Chọn loại đồ vật --</option>
                                        {itemTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    {(formData.itemType === 'Khác' || isCustomItemType) && (
                                        <input
                                            type="text"
                                            name="customItemType"
                                            value={formData.customItemType}
                                            onChange={handleChange}
                                            placeholder="Nhập loại đồ vật khác..."
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none mt-2"
                                            required
                                        />
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Vị trí <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="location"
                                        value={isCustomLocation && formData.location !== 'Khác' ? 'Khác' : formData.location}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    >
                                        <option value="">-- Chọn vị trí --</option>
                                        {locations.map(loc => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                    {(formData.location === 'Khác' || isCustomLocation) && (
                                        <input
                                            type="text"
                                            name="customLocation"
                                            value={formData.customLocation}
                                            onChange={handleChange}
                                            placeholder="Nhập vị trí khác..."
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none mt-2"
                                            required
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hình ảnh */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Image className="w-5 h-5 text-blue-500" />
                            Hình ảnh (tối đa 5 ảnh)
                        </h3>
                        <div className="flex flex-wrap gap-4">
                            {/* Ảnh hiện có */}
                            {existingImages.map((img, index) => (
                                <div key={`existing-${index}`} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                                    <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(index)}
                                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {/* Ảnh mới */}
                            {previewImages.map((preview, index) => (
                                <div key={`new-${index}`} className="relative w-24 h-24 rounded-xl overflow-hidden border border-blue-300">
                                    <img src={preview} alt="" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(index)}
                                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className="absolute bottom-1 left-1 text-xs bg-blue-500 text-white px-1 rounded">Mới</span>
                                </div>
                            ))}
                            {existingImages.length + newImages.length < 5 && (
                                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                                    <Plus className="w-6 h-6 text-gray-400" />
                                    <span className="text-xs text-gray-400 mt-1">Thêm ảnh</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>


                    {/* Thông tin liên hệ */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-500" />
                            Thông tin liên hệ
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    name="contactPhone"
                                    value={formData.contactPhone}
                                    onChange={handleChange}
                                    placeholder="0123 456 789"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="contactEmail"
                                    value={formData.contactEmail}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </AdminSection>
    );
}
