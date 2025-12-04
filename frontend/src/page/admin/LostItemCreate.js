import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, FileText, Image, Send, X, Plus } from 'lucide-react';
import { createPost } from '../../api/posts.api';
import { AuthContext } from '../../core/AuthContext';
import AdminSection from './components/AdminSection';

export default function LostItemCreate() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'found', // Admin thường nhập đồ nhặt được
        itemType: '',
        location: '',
        contactPhone: '',
        contactEmail: ''
    });

    const locations = [
        'Thư viện',
        'Căn tin',
        'Nhà xe',
        'Sân trường',
        'Phòng học A',
        'Phòng học B',
        'Phòng học C',
        'Phòng học D',
        'Nhà thi đấu',
        'Ký túc xá',
        'Cổng trường',
        'Khác'
    ];

    const itemTypes = [
        'Điện thoại',
        'Ví/Bóp',
        'Chìa khóa',
        'Thẻ sinh viên',
        'Laptop',
        'Tai nghe',
        'Sách vở',
        'Quần áo',
        'Túi xách',
        'Đồng hồ',
        'Kính mắt',
        'Khác'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            alert('Chỉ được tải tối đa 5 ảnh');
            return;
        }

        const newImages = [...images, ...files];
        setImages(newImages);

        // Tạo preview
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.itemType || !formData.location) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        setLoading(true);
        try {
            const payload = new FormData();
            payload.append('title', formData.title);
            payload.append('description', formData.description);
            payload.append('category', formData.category);
            payload.append('itemType', formData.itemType);
            payload.append('location', formData.location);
            payload.append('contactInfo', JSON.stringify({
                phone: formData.contactPhone,
                email: formData.contactEmail
            }));

            images.forEach(img => {
                payload.append('images', img);
            });

            await createPost(payload);
            alert('Thêm bài đăng thành công!');
            navigate('/admin/lost-items');
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminSection title="Thêm đồ thất lạc">
            <div className="w-full">
                <form onSubmit={handleSubmit} className="space-y-6">
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
                                        value={formData.itemType}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    >
                                        <option value="">-- Chọn loại đồ vật --</option>
                                        {itemTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Vị trí <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    >
                                        <option value="">-- Chọn vị trí --</option>
                                        {locations.map(loc => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
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
                            {previewImages.map((preview, index) => (
                                <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                                    <img src={preview} alt="" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {images.length < 5 && (
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
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                            {loading ? 'Đang xử lý...' : 'Đăng bài'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/lost-items')}
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
