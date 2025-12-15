import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Save, Edit2, Camera, X, MapPin, Clock, Package, FileText, Image, Grid3X3, Trash2 } from 'lucide-react';
import { inforUser, updateUser, getUserById } from '../../api/users.api';
import { fetchPosts, deletePost } from '../../api/posts.api';
import { AuthContext } from '../../core/AuthContext';
import { getImageUrl } from '../../utils/constant';
import { ProfileSkeleton } from '../../core/LoadingSpinner';

const Profile = () => {
    const navigate = useNavigate();
    const { userId } = useParams(); // Lấy userId từ URL nếu có
    const { token, setUserInfo, refreshUser, user: currentUser } = useContext(AuthContext);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [activeTab, setActiveTab] = useState('posts');
    const fileInputRef = useRef(null);
    const coverInputRef = useRef(null);
    
    // Kiểm tra xem đang xem profile của mình hay của người khác
    const isOwnProfile = !userId || (currentUser && (userId === currentUser._id || userId === currentUser.id));

    const { register, handleSubmit, formState: { errors }, reset } = useForm({ mode: "onTouched" });

    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        if (userId && !isOwnProfile) {
            fetchOtherUserInfo(userId);
        } else {
            fetchUserInfo();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, navigate, userId]);

    useEffect(() => {
        if (user?._id) fetchUserPosts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?._id]);

    const fetchUserInfo = async () => {
        try {
            const userData = await inforUser();
            if (userData) {
                setUser(userData);
                setUserInfo(userData);
                reset(userData);
                // Chỉ set avatar nếu có giá trị hợp lệ (path đầy đủ hoặc URL)
                if (userData.avatar && userData.avatar.length > 5 && (userData.avatar.includes('/') || userData.avatar.startsWith('http'))) {
                    setAvatarPreview(getImageUrl(userData.avatar));
                } else {
                    setAvatarPreview(null);
                }
                if (userData.coverPhoto && userData.coverPhoto.length > 5) {
                    setCoverPreview(getImageUrl(userData.coverPhoto));
                } else {
                    setCoverPreview(null);
                }
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Lấy thông tin profile của user khác
    const fetchOtherUserInfo = async (id) => {
        try {
            const userData = await getUserById(id);
            if (userData) {
                setUser(userData);
                if (userData.avatar && userData.avatar.length > 5 && (userData.avatar.includes('/') || userData.avatar.startsWith('http'))) {
                    setAvatarPreview(getImageUrl(userData.avatar));
                } else {
                    setAvatarPreview(null);
                }
                if (userData.coverPhoto && userData.coverPhoto.length > 5) {
                    setCoverPreview(getImageUrl(userData.coverPhoto));
                } else {
                    setCoverPreview(null);
                }
            }
        } catch (error) {
            console.error('Error fetching other user:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserPosts = async () => {
        setLoadingPosts(true);
        try {
            // Lấy userId - xử lý nhiều format có thể có
            let userId = user._id;
            if (typeof userId === 'object' && userId !== null) {
                userId = userId.$oid || userId.toString();
            }
            if (!userId) userId = user.id;
            
            // Đảm bảo userId là string
            if (userId) userId = String(userId);
            
            if (!userId) {
                setUserPosts([]);
                setLoadingPosts(false);
                return;
            }
            
            // Fetch bài đăng của user
            const result = await fetchPosts({ userId: userId, limit: 100 });
            
            if (result?.data && result.data.length > 0) {
                const sorted = result.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setUserPosts(sorted);
            } else {
                setUserPosts([]);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoadingPosts(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) { setError('Vui lòng chọn file ảnh'); return; }
            if (file.size > 5 * 1024 * 1024) { setError('Ảnh không được vượt quá 5MB'); return; }
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result);
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) { setError('Vui lòng chọn file ảnh'); return; }
            if (file.size > 5 * 1024 * 1024) { setError('Ảnh không được vượt quá 5MB'); return; }
            setCoverFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setCoverPreview(reader.result);
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const onSubmit = async (data) => {
        setError(''); setSuccess('');
        try {
            let payload;
            if (avatarFile || coverFile) {
                payload = new FormData();
                payload.append('fullname', data.fullname);
                payload.append('email', data.email);
                if (data.phone) payload.append('phone', data.phone);
                if (avatarFile) payload.append('avatar', avatarFile);
                if (coverFile) payload.append('coverPhoto', coverFile);
            } else {
                payload = { fullname: data.fullname, email: data.email, phone: data.phone || '' };
            }
            const result = await updateUser(payload);
            const fetched = await refreshUser();
            if (fetched) {
                setUser(fetched); reset(fetched); setUserInfo(fetched);
                setAvatarPreview(fetched.avatar ? getImageUrl(fetched.avatar) : null);
                setCoverPreview(fetched.coverPhoto ? getImageUrl(fetched.coverPhoto) : null);
            } else { await fetchUserInfo(); }
            setAvatarFile(null); setCoverFile(null);
            setSuccess(result?.message || 'Cập nhật thành công!');
            setIsEditing(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const cancelEdit = () => {
        setIsEditing(false); reset(user); setError(''); setSuccess('');
        setAvatarFile(null); setCoverFile(null);
        setAvatarPreview(user?.avatar ? getImageUrl(user.avatar) : null);
        setCoverPreview(user?.coverPhoto ? getImageUrl(user.coverPhoto) : null);
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Bạn có chắc muốn xóa bài đăng này?')) return;
        try {
            await deletePost(postId);
            setUserPosts(prev => prev.filter(p => p._id !== postId));
            setSuccess('Đã xóa bài đăng');
        } catch (error) {
            setError('Có lỗi khi xóa bài đăng');
        }
    };

    // Lấy tất cả ảnh từ các bài đăng của user
    const allPhotos = userPosts.flatMap(post => {
        const postId = post._id?.$oid || post._id;
        return (post.images || []).map(img => ({ 
            image: img, 
            postId: postId, 
            title: post.title 
        }));
    });

    if (loading) return <div className="min-h-screen bg-gray-100 py-8 px-4"><div className="max-w-4xl mx-auto"><ProfileSkeleton /></div></div>;
    if (!user) return <div className="min-h-screen flex items-center justify-center"><h2 className="text-2xl font-bold">Không tìm thấy thông tin</h2></div>;


    return (
        <div className="min-h-screen bg-gray-100">
            {/* Alerts */}
            {(error || success) && (
                <div className="fixed top-4 right-4 z-50">
                    {error && <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 mb-2"><X className="w-4 h-4" /> {error}</div>}
                    {success && <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2"><Save className="w-4 h-4" /> {success}</div>}
                </div>
            )}

            {/* Profile Header */}
            <div className="bg-white shadow-sm">
                {/* Cover Photo */}
                <div className="relative h-64 md:h-72">
                    {coverPreview ? (
                        <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>
                    )}
                    {isEditing && (
                        <label className="absolute top-4 right-4 cursor-pointer">
                            <div className="flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition">
                                <Camera className="w-4 h-4" /> <span className="text-sm">Đổi ảnh bìa</span>
                            </div>
                            <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                        </label>
                    )}
                </div>

                {/* Avatar & Name */}
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex flex-col items-center -mt-20 relative">
                        <div className="relative">
                            <div className="w-40 h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                                {avatarPreview && avatarPreview.length > 10 ? (
                                    <img 
                                        src={avatarPreview} 
                                        alt="Avatar" 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div className={`w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 items-center justify-center ${avatarPreview && avatarPreview.length > 10 ? 'hidden' : 'flex'}`}>
                                    <span className="text-5xl font-bold text-white">{user.fullname?.charAt(0)?.toUpperCase() || 'U'}</span>
                                </div>
                            </div>
                            {isEditing && (
                                <label className="absolute bottom-2 right-2 cursor-pointer">
                                    <div className="w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg transition">
                                        <Camera className="w-5 h-5 text-white" />
                                    </div>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                </label>
                            )}
                        </div>
                        <h1 className="mt-4 text-2xl md:text-3xl font-bold text-gray-900">{user.fullname}</h1>
                        <p className="text-gray-500">{user.email}</p>
                        
                        {/* Nút Lưu/Hủy khi đang chỉnh sửa */}
                        {isEditing && (
                            <div className="flex gap-3 mt-4">
                                <button onClick={handleSubmit(onSubmit)} className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium shadow-lg">
                                    <Save className="w-4 h-4" /> Lưu thay đổi
                                </button>
                                <button onClick={cancelEdit} className="flex items-center gap-2 px-6 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition text-sm font-medium border border-gray-300">
                                    <X className="w-4 h-4" /> Hủy
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex justify-center border-t border-gray-200 mt-6">
                        <button onClick={() => setActiveTab('posts')} className={`flex items-center gap-2 px-6 py-4 font-medium transition border-b-2 ${activeTab === 'posts' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'}`}>
                            <FileText className="w-4 h-4" /> Bài đăng
                        </button>
                        <button onClick={() => setActiveTab('about')} className={`flex items-center gap-2 px-6 py-4 font-medium transition border-b-2 ${activeTab === 'about' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'}`}>
                            <User className="w-4 h-4" /> Giới thiệu
                        </button>
                        <button onClick={() => setActiveTab('photos')} className={`flex items-center gap-2 px-6 py-4 font-medium transition border-b-2 ${activeTab === 'photos' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'}`}>
                            <Image className="w-4 h-4" /> Ảnh
                        </button>
                    </div>
                </div>
            </div>


            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Tab: Bài đăng */}
                {activeTab === 'posts' && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-800">Bài đăng ({userPosts.length})</h2>
                            <Link to="/baidang/create" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm">+ Đăng bài mới</Link>
                        </div>

                        {loadingPosts ? (
                            <div className="text-center py-8"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                        ) : userPosts.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Bạn chưa có bài đăng nào</p>
                                <Link to="/baidang/create" className="inline-block mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Tạo bài đăng đầu tiên</Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {userPosts.map((post) => (
                                    <div key={post._id} className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition group">
                                        <Link to={`/baidang/${post._id}`} className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                            {post.images?.[0] ? (
                                                <img src={getImageUrl(post.images[0])} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-gray-300" /></div>
                                            )}
                                        </Link>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <Link to={`/baidang/${post._id}`} className="font-semibold text-gray-800 truncate hover:text-blue-600">{post.title}</Link>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${post.category === 'lost' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                                        {post.category === 'lost' ? '🔍 Thất lạc' : '✨ Nhặt được'}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.description}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{post.location}</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                                                    <span className={`px-2 py-0.5 rounded text-xs ${post.status === 'approved' ? 'bg-green-100 text-green-600' : post.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : post.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'}`}>
                                                        {post.status === 'approved' ? 'Đã duyệt' : post.status === 'pending' ? 'Chờ duyệt' : post.status === 'rejected' ? 'Từ chối' : 'Hoàn thành'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Link to={`/baidang/${post._id}`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Chỉnh sửa">
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>
                                                    <button onClick={() => handleDeletePost(post._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Xóa">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Giới thiệu */}
                {activeTab === 'about' && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-800">Giới thiệu</h2>
                            {!isEditing && (
                                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm">
                                    <Edit2 className="w-4 h-4" /> Chỉnh sửa
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <form className="space-y-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1"><User className="w-4 h-4 text-blue-500" /> Họ và tên</label>
                                    <input {...register("fullname", { required: "Họ tên là bắt buộc" })} type="text" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                    {errors.fullname && <p className="text-red-500 text-sm mt-1">{errors.fullname.message}</p>}
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1"><Mail className="w-4 h-4 text-blue-500" /> Email</label>
                                    <input {...register("email", { required: "Email là bắt buộc", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email không hợp lệ" } })} type="email" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1"><Phone className="w-4 h-4 text-blue-500" /> Số điện thoại</label>
                                    <input {...register("phone", { pattern: { value: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ" } })} type="tel" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                                </div>
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-gray-500 mb-2">Đổi ảnh đại diện và ảnh bìa</p>
                                    <div className="flex gap-4">
                                        <label className="cursor-pointer">
                                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm">
                                                <Camera className="w-4 h-4" /> Đổi avatar
                                            </div>
                                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                        </label>
                                        <label className="cursor-pointer">
                                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm">
                                                <Image className="w-4 h-4" /> Đổi ảnh bìa
                                            </div>
                                            <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                                        </label>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><User className="w-6 h-6 text-blue-600" /></div>
                                    <div><p className="text-sm text-gray-500">Họ và tên</p><p className="font-semibold text-gray-800">{user.fullname}</p></div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"><Mail className="w-6 h-6 text-green-600" /></div>
                                    <div><p className="text-sm text-gray-500">Email</p><p className="font-semibold text-gray-800">{user.email}</p></div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center"><Phone className="w-6 h-6 text-purple-600" /></div>
                                    <div><p className="text-sm text-gray-500">Số điện thoại</p><p className="font-semibold text-gray-800">{user.phone || 'Chưa cập nhật'}</p></div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center"><Package className="w-6 h-6 text-orange-600" /></div>
                                    <div><p className="text-sm text-gray-500">Số bài đăng</p><p className="font-semibold text-gray-800">{userPosts.length} bài đăng</p></div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center"><Clock className="w-6 h-6 text-pink-600" /></div>
                                    <div><p className="text-sm text-gray-500">Ngày tham gia</p><p className="font-semibold text-gray-800">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Không rõ'}</p></div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Ảnh */}
                {activeTab === 'photos' && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Grid3X3 className="w-5 h-5" /> Ảnh ({allPhotos.length})</h2>
                        {allPhotos.length === 0 ? (
                            <div className="text-center py-12">
                                <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Chưa có ảnh nào</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                {allPhotos.map((photo, index) => (
                                    <Link key={index} to={`/baidang/${photo.postId}`} className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition group">
                                        <img src={getImageUrl(photo.image)} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
