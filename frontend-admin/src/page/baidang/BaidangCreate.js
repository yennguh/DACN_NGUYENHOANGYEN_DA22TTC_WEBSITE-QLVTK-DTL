import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Upload, X, AlertCircle, MapPin, Phone, Mail, FileText, Tag, Image, ChevronRight, Sparkles, Clock } from 'lucide-react';
import { createPost } from '../../api/posts.api';
import { AuthContext } from '../../core/AuthContext';

const BaidangCreate = () => {
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState(1);

    const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm({ mode: "onTouched" });
    const category = watch('category');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (images.length >= 5) { setError('Tối đa 5 ảnh'); e.target.value = ''; return; }
        if (file.size > 2 * 1024 * 1024) { setError('Mỗi ảnh tối đa 2MB'); e.target.value = ''; return; }
        if (!file.type.startsWith('image/')) { setError('Vui lòng chọn file ảnh'); e.target.value = ''; return; }
        setError('');
        const reader = new FileReader();
        reader.onloadend = () => setImages(prev => [...prev, reader.result]);
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const removeImage = (index) => setImages(prev => prev.filter((_, i) => i !== index));

    const nextStep = async () => {
        let fields = currentStep === 1 ? ['category', 'title', 'itemType'] : currentStep === 2 ? ['location', 'description'] : [];
        if (await trigger(fields)) setCurrentStep(prev => Math.min(prev + 1, 4));
    };

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const onSubmit = async (data) => {
        if (!token) { setError('Vui lòng đăng nhập'); return; }
        if (images.length === 0) { setError('Vui lòng tải ít nhất 1 ảnh'); return; }
        setIsSubmitting(true);
        setError('');
        try {
            const payload = {
                title: data.title,
                description: data.description,
                category: data.category,
                itemType: data.itemType,
                location: data.location,
                images: images,
                contactInfo: { phone: data.phone || '', email: data.email || '' },
                status: 'pending'
            };
            const result = await createPost(payload);
            if (result) {
                alert('Đăng tin thành công! Bài đăng đang chờ Admin duyệt.');
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center border border-gray-100">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <AlertCircle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Yêu cầu đăng nhập</h2>
                    <p className="text-gray-500 mb-8">Bạn cần đăng nhập để đăng tin</p>
                    <button onClick={() => navigate('/login')} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-semibold">
                        Đăng nhập ngay
                    </button>
                </div>
            </div>
        );
    }

    const steps = [
        { number: 1, title: 'Thông tin', icon: FileText },
        { number: 2, title: 'Chi tiết', icon: MapPin },
        { number: 3, title: 'Hình ảnh', icon: Image },
        { number: 4, title: 'Liên hệ', icon: Phone },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                        <Sparkles className="w-4 h-4" />Đăng tin mới
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Đăng tin đồ thất lạc</h1>
                    <p className="text-gray-500">Điền thông tin chi tiết để tìm lại đồ vật của bạn</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <p className="text-amber-700 text-sm">Bài đăng sẽ được Admin xem xét và duyệt trước khi hiển thị công khai.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${currentStep >= step.number ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                                        <step.icon className="w-5 h-5" />
                                    </div>
                                    <span className={`text-xs mt-2 font-medium hidden md:block ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'}`}>{step.title}</span>
                                </div>
                                {index < steps.length - 1 && <div className={`w-12 md:w-24 h-1 mx-2 rounded-full ${currentStep > step.number ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gray-200'}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" /><span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6"><FileText className="w-5 h-5 text-blue-600" />Thông tin cơ bản</h2>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Loại tin đăng <span className="text-red-500">*</span></label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className={`flex flex-col items-center p-6 border-2 rounded-2xl cursor-pointer transition-all ${category === 'lost' ? 'border-red-500 bg-red-50 shadow-lg' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <input {...register("category", { required: "Vui lòng chọn loại tin" })} type="radio" value="lost" className="sr-only" />
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${category === 'lost' ? 'bg-red-500' : 'bg-gray-200'}`}><span className="text-3xl">😢</span></div>
                                            <span className={`font-semibold ${category === 'lost' ? 'text-red-600' : 'text-gray-700'}`}>Đồ thất lạc</span>
                                            <span className="text-xs text-gray-500 mt-1">Báo mất đồ</span>
                                        </label>
                                        <label className={`flex flex-col items-center p-6 border-2 rounded-2xl cursor-pointer transition-all ${category === 'found' ? 'border-green-500 bg-green-50 shadow-lg' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <input {...register("category", { required: "Vui lòng chọn loại tin" })} type="radio" value="found" className="sr-only" />
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${category === 'found' ? 'bg-green-500' : 'bg-gray-200'}`}><span className="text-3xl">🎉</span></div>
                                            <span className={`font-semibold ${category === 'found' ? 'text-green-600' : 'text-gray-700'}`}>Đồ nhặt được</span>
                                            <span className="text-xs text-gray-500 mt-1">Tìm chủ nhân</span>
                                        </label>
                                    </div>
                                    {errors.category && <p className="text-red-500 text-sm mt-2">{errors.category.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Tiêu đề <span className="text-red-500">*</span></label>
                                    <input {...register("title", { required: "Tiêu đề là bắt buộc", minLength: { value: 10, message: "Tối thiểu 10 ký tự" } })} type="text" placeholder="VD: Điện thoại iPhone bị mất ở thư viện" className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                    {errors.title && <p className="text-red-500 text-sm mt-2">{errors.title.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3"><Tag className="w-4 h-4 inline mr-2 text-blue-600" />Loại đồ vật <span className="text-red-500">*</span></label>
                                    <input {...register("itemType", { required: "Loại đồ vật là bắt buộc" })} type="text" placeholder="VD: Điện thoại, Chìa khóa, Ví..." className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                    {errors.itemType && <p className="text-red-500 text-sm mt-2">{errors.itemType.message}</p>}
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6"><MapPin className="w-5 h-5 text-blue-600" />Chi tiết vị trí & mô tả</h2>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3"><MapPin className="w-4 h-4 inline mr-2 text-blue-600" />Vị trí {category === 'lost' ? 'mất' : 'nhặt được'} <span className="text-red-500">*</span></label>
                                    <input {...register("location", { required: "Vị trí là bắt buộc" })} type="text" placeholder="VD: Thư viện A, Căn tin..." className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                    {errors.location && <p className="text-red-500 text-sm mt-2">{errors.location.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Mô tả chi tiết <span className="text-red-500">*</span></label>
                                    <textarea {...register("description", { required: "Mô tả là bắt buộc", minLength: { value: 20, message: "Tối thiểu 20 ký tự" } })} rows="6" placeholder="Mô tả chi tiết về đồ vật..." className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" />
                                    {errors.description && <p className="text-red-500 text-sm mt-2">{errors.description.message}</p>}
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6"><Image className="w-5 h-5 text-blue-600" />Hình ảnh minh họa</h2>
                                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
                                    <p className="text-blue-700 text-sm">💡 Tải lên hình ảnh rõ ràng. Tối đa 5 ảnh, mỗi ảnh không quá 2MB.</p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {images.map((img, index) => (
                                        <div key={index} className="relative group">
                                            <img src={img} alt={`Preview ${index + 1}`} className="w-full h-40 object-cover rounded-2xl border-2 border-gray-200 shadow-md" />
                                            <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-all"><X className="w-4 h-4" /></button>
                                            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">Ảnh {index + 1}</div>
                                        </div>
                                    ))}
                                    {images.length < 5 && (
                                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl h-40 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group">
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-100"><Upload className="w-6 h-6 text-gray-400 group-hover:text-blue-500" /></div>
                                            <span className="text-sm text-gray-500 group-hover:text-blue-600 font-medium">Thêm ảnh</span>
                                            <span className="text-xs text-gray-400 mt-1">{images.length}/5 ảnh</span>
                                        </label>
                                    )}
                                </div>
                                {images.length === 0 && <p className="text-red-500 text-sm text-center mt-4">⚠️ Vui lòng tải ít nhất 1 ảnh</p>}
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6"><Phone className="w-5 h-5 text-blue-600" />Thông tin liên hệ</h2>
                                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
                                    <p className="text-green-700 text-sm">✅ Thông tin liên hệ giúp người khác liên lạc với bạn khi tìm thấy đồ vật.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3"><Phone className="w-4 h-4 inline mr-2 text-blue-600" />Số điện thoại</label>
                                        <input {...register("phone", { pattern: { value: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ" } })} type="tel" placeholder="0962xxxxxx" className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                        {errors.phone && <p className="text-red-500 text-sm mt-2">{errors.phone.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3"><Mail className="w-4 h-4 inline mr-2 text-blue-600" />Email</label>
                                        <input {...register("email", { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email không hợp lệ" } })} type="email" placeholder="email@example.com" className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                        {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email.message}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
                            <button type="button" onClick={currentStep === 1 ? () => navigate('/') : prevStep} className="px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium">
                                {currentStep === 1 ? 'Hủy' : '← Quay lại'}
                            </button>
                            {currentStep < 4 ? (
                                <button type="button" onClick={nextStep} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg flex items-center gap-2">
                                    Tiếp theo <ChevronRight className="w-5 h-5" />
                                </button>
                            ) : (
                                <button type="submit" disabled={isSubmitting || images.length === 0} className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                    {isSubmitting ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Đang đăng...</>) : (<><Sparkles className="w-5 h-5" />Gửi bài đăng</>)}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BaidangCreate;
