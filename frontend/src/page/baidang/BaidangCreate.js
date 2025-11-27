import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Upload, X, AlertCircle } from 'lucide-react';
import { createPost } from '../../api/posts.api';
import { AuthContext } from '../../core/AuthContext';

const BaidangCreate = () => {
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const [images, setImages] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors }, watch } = useForm({
        mode: "onTouched"
    });

    const category = watch('category');

    // Handle image upload - chỉ cho phép chọn 1 ảnh mỗi lần
    const handleImageChange = (e) => {
        const file = e.target.files[0]; // Chỉ lấy file đầu tiên
        if (!file) return;

        // Kiểm tra số lượng ảnh
        if (images.length >= 5) {
            setError('Tối đa 5 ảnh');
            e.target.value = ''; // Reset input
            return;
        }

        // Kiểm tra kích thước (giảm xuống 2MB để tránh payload quá lớn)
        if (file.size > 2 * 1024 * 1024) {
            setError('Mỗi ảnh tối đa 2MB. Vui lòng chọn ảnh nhỏ hơn.');
            e.target.value = ''; // Reset input
            return;
        }

        // Kiểm tra định dạng
        if (!file.type.startsWith('image/')) {
            setError('Vui lòng chọn file ảnh');
            e.target.value = ''; // Reset input
            return;
        }

        setError(''); // Clear error nếu hợp lệ

        const reader = new FileReader();
        reader.onloadend = () => {
            setImages(prev => [...prev, reader.result]);
            setImageFiles(prev => [...prev, file]);
        };
        reader.onerror = () => {
            setError('Lỗi khi đọc file ảnh');
        };
        reader.readAsDataURL(file);
        
        // Reset input để có thể chọn lại cùng file nếu cần
        e.target.value = '';
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data) => {
        if (!token) {
            setError('Vui lòng đăng nhập để đăng tin');
            return;
        }

        if (images.length === 0) {
            setError('Vui lòng tải ít nhất 1 ảnh');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            // Convert images to base64 strings (in production, upload to cloud storage)
            const imageUrls = images; // For now, using base64. In production, upload to S3/Cloudinary

            const payload = {
                title: data.title,
                description: data.description,
                category: data.category,
                itemType: data.itemType,
                location: data.location,
                images: imageUrls,
                contactInfo: {
                    phone: data.phone || '',
                    email: data.email || ''
                }
            };

            const result = await createPost(payload);
            if (result) {
                alert('Đăng tin thành công! Bài đăng đang chờ duyệt.');
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi đăng tin');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-4">Yêu cầu đăng nhập</h2>
                    <p className="text-gray-600 mb-6">Bạn cần đăng nhập để đăng tin</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Đăng nhập
                    </button>
                </div>
            </div>
        );
    }

  return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Đăng tin đồ thất lạc</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loại tin đăng <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register("category", { required: "Vui lòng chọn loại tin đăng" })}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">-- Chọn loại --</option>
                            <option value="lost">Đồ thất lạc (Báo mất)</option>
                            <option value="found">Đồ nhặt được</option>
                        </select>
                        {errors.category && (
                            <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                        )}
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tiêu đề <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register("title", { 
                                required: "Tiêu đề là bắt buộc",
                                minLength: { value: 10, message: "Tiêu đề tối thiểu 10 ký tự" }
                            })}
                            type="text"
                            placeholder="VD: Điện thoại iPhone 12 bị mất ở thư viện"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                        )}
                    </div>

                    {/* Item Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loại đồ vật <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register("itemType", { required: "Loại đồ vật là bắt buộc" })}
                            type="text"
                            placeholder="VD: Điện thoại, Chìa khóa, Ví, Balo..."
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {errors.itemType && (
                            <p className="text-red-500 text-sm mt-1">{errors.itemType.message}</p>
                        )}
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vị trí {category === 'lost' ? 'mất' : 'nhặt được'} <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register("location", { required: "Vị trí là bắt buộc" })}
                            type="text"
                            placeholder="VD: Thư viện A, Căn tin, Giảng đường B2..."
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {errors.location && (
                            <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mô tả chi tiết <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            {...register("description", { 
                                required: "Mô tả là bắt buộc",
                                minLength: { value: 20, message: "Mô tả tối thiểu 20 ký tự" }
                            })}
                            rows="5"
                            placeholder="Mô tả chi tiết về đồ vật, đặc điểm nhận dạng, thời gian..."
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Images */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hình ảnh <span className="text-red-500">*</span> (Tối đa 5 ảnh, mỗi ảnh tối đa 2MB)
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            {images.map((img, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={img}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {images.length < 5 && (
                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-32 cursor-pointer hover:border-blue-500 transition">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <Upload className="w-8 h-8 text-gray-400 mb-1" />
                                    <span className="text-xs text-gray-500">Chọn 1 ảnh</span>
                                </label>
                            )}
                        </div>
                        {images.length === 0 && (
                            <p className="text-red-500 text-sm">Vui lòng tải ít nhất 1 ảnh</p>
                        )}
                        {images.length > 0 && images.length < 5 && (
                            <p className="text-gray-500 text-sm mt-2">
                                Đã chọn {images.length}/5 ảnh. Bạn có thể thêm ảnh khác bằng cách click vào ô "Chọn 1 ảnh"
                            </p>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold mb-4">Thông tin liên hệ</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số điện thoại
                                </label>
                                <input
                                    {...register("phone", {
                                        pattern: {
                                            value: /^[0-9]{10}$/,
                                            message: "Số điện thoại không hợp lệ"
                                        }
                                    })}
                                    type="tel"
                                    placeholder="0962xxxxxx"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    {...register("email", {
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: "Email không hợp lệ"
                                        }
                                    })}
                                    type="email"
                                    placeholder="email@example.com"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {isSubmitting ? 'Đang đăng...' : 'Đăng tin'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            Hủy
        </button>
                    </div>
      </form>
            </div>
    </div>
  );
};

export default BaidangCreate;
