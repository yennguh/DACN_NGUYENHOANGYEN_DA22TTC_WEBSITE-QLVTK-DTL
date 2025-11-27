import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, MapPin, Package, Phone, Mail, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { fetchPostById, deletePost, updatePost } from '../../api/posts.api';
import { inforUser } from '../../api/users.api';
import { getImageUrl } from '../../utils/constant';
import { AuthContext } from '../../core/AuthContext';
import { jwtDecode } from 'jwt-decode';

const BaidangDetail = () => {
  const { id } = useParams();
    const navigate = useNavigate();
    const { token, user: authUser } = useContext(AuthContext);
    const [post, setPost] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isOwner, setIsOwner] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const postData = await fetchPostById(id);
                if (postData) {
                    setPost(postData);
                    
                    // Check if current user is owner
                    if (token) {
                        try {
                            const decoded = jwtDecode(token);
                            setIsOwner(postData.userId === decoded._id);
                            setIsAdmin(decoded.roles?.includes('admin') || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']?.includes('admin'));
                        } catch (err) {
                            console.error('Error decoding token:', err);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching post:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, token]);

    useEffect(() => {
        if (post?.user) {
            setUser(post.user);
        }
    }, [post]);

    // If the logged-in user updated their profile (avatar/name), update displayed post user
    useEffect(() => {
        if (!authUser || !post) return;
        try {
            if (post.user && (post.user._id === authUser._id || post.user._id === authUser._id)) {
                setPost(prev => ({ ...prev, user: { ...prev.user, avatar: authUser.avatar, fullname: authUser.fullname } }));
                setUser(authUser);
            }
        } catch (err) {
            // ignore
        }
    }, [authUser]);

    // Contact edit state
    const [editingContact, setEditingContact] = useState(false);
    const [contactPhone, setContactPhone] = useState('');
    const [contactEmail, setContactEmail] = useState('');

    useEffect(() => {
        if (post?.contactInfo) {
            setContactPhone(post.contactInfo.phone || '');
            setContactEmail(post.contactInfo.email || '');
        }
    }, [post]);

    const handleSaveContact = async () => {
        if (!isOwner) return;
        try {
            const payload = { contactInfo: { phone: contactPhone || '', email: contactEmail || '' } };
            await updatePost(id, payload);
            // refresh post
            const refreshed = await fetchPostById(id);
            setPost(refreshed);
            alert('Cập nhật thông tin liên hệ thành công');
            setEditingContact(false);
        } catch (err) {
            console.error('Error updating contact info:', err);
            alert('Có lỗi khi cập nhật thông tin liên hệ');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bài đăng này?')) {
            return;
        }

        try {
            await deletePost(id);
            alert('Xóa bài đăng thành công');
            navigate(isAdmin ? '/admin' : '/');
        } catch (error) {
            alert('Có lỗi xảy ra khi xóa bài đăng');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Đang tải...</div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Không tìm thấy bài đăng</h2>
                    <Link to="/" className="text-blue-600 hover:underline">Quay về trang chủ</Link>
                </div>
            </div>
        );
    }

  return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Quay lại
                </button>

                {/* Actions (if owner or admin) */}
                {(isOwner || isAdmin) && (
                    <div className="flex gap-2 mb-4">
                        {isOwner && (
                            <Link
                                to={`/baidang/${id}/edit`}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Edit className="w-4 h-4" />
                                Chỉnh sửa
                            </Link>
                        )}
                        {(isOwner || isAdmin) && (
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                <Trash2 className="w-4 h-4" />
                                Xóa
                            </button>
                        )}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Images */}
                    {post.images && post.images.length > 0 && (
                        <div className="relative">
                            <img
                                src={post.images[currentImageIndex]}
                                alt={post.title}
                                className="w-full h-96 object-cover"
                            />
                            {post.images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImageIndex(prev => 
                                            prev > 0 ? prev - 1 : post.images.length - 1
                                        )}
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                                    >
                                        ‹
                                    </button>
                                    <button
                                        onClick={() => setCurrentImageIndex(prev => 
                                            prev < post.images.length - 1 ? prev + 1 : 0
                                        )}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                                    >
                                        ›
                                    </button>
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                        {post.images.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`w-2 h-2 rounded-full ${
                                                    index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <div className="p-6">
                        {/* Title */}
                        <h1 className="text-3xl font-bold mb-4 text-gray-800">{post.title}</h1>

                        {/* Meta info */}
                        <div className="flex flex-wrap gap-4 mb-6 text-gray-600">
                            <div className="flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                <span>{post.itemType}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                <span>{post.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    post.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    post.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    post.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                    {post.status === 'approved' ? 'Đã duyệt' :
                                     post.status === 'pending' ? 'Chờ duyệt' :
                                     post.status === 'rejected' ? 'Đã từ chối' :
                                     'Đã hoàn thành'}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold mb-2">Mô tả chi tiết</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{post.description}</p>
                        </div>

                        {/* Contact Info */}
                        {(post.contactInfo?.phone || post.contactInfo?.email || user) && (
                            <div className="border-t pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold">Thông tin liên hệ</h2>
                                    {isOwner && (
                                        <div>
                                            {!editingContact ? (
                                                <button
                                                    onClick={() => setEditingContact(true)}
                                                    className="text-sm px-3 py-1 bg-yellow-100 text-yellow-800 rounded"
                                                >
                                                    Chỉnh sửa liên hệ
                                                </button>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleSaveContact}
                                                        className="text-sm px-3 py-1 bg-green-600 text-white rounded"
                                                    >
                                                        Lưu
                                                    </button>
                                                    <button
                                                        onClick={() => { setEditingContact(false); setContactPhone(post.contactInfo?.phone || ''); setContactEmail(post.contactInfo?.email || ''); }}
                                                        className="text-sm px-3 py-1 bg-gray-200 text-gray-800 rounded"
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {user && (
                                        <div className="flex items-center gap-3">
                                            {user.avatar ? (
                                                <img
                                                    src={getImageUrl(user.avatar)}
                                                    alt={user.fullname}
                                                    className="w-12 h-12 rounded-full object-cover border"
                                                    onError={(e) => {
                                                        try {
                                                            if (e && e.target) {
                                                                e.target.style.display = 'none';
                                                                const next = e.target.nextElementSibling;
                                                                if (next && next.style) next.style.display = 'flex';
                                                            }
                                                        } catch (err) {
                                                            // ignore
                                                        }
                                                    }}
                                                />
                                            ) : null}
                                            <div className="flex items-center gap-3">
                                                {!user.avatar && (
                                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-white font-semibold">
                                                        {user.fullname ? user.fullname.substring(0,2).toUpperCase() : 'U'}
                                                    </div>
                                                )}
                                                <p className="text-gray-700">
                                                    <span className="font-medium">Người đăng:</span> {user.fullname}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {!editingContact ? (
                                        <>
                                            {post.contactInfo?.phone && (
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Phone className="w-5 h-5" />
                                                    <a href={`tel:${post.contactInfo.phone}`} className="hover:text-blue-600">
                                                        {post.contactInfo.phone}
                                                    </a>
                                                </div>
                                            )}
                                            {post.contactInfo?.email && (
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Mail className="w-5 h-5" />
                                                    <a href={`mailto:${post.contactInfo.email}`} className="hover:text-blue-600">
                                                        {post.contactInfo.email}
                                                    </a>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                                <input
                                                    type="text"
                                                    value={contactPhone}
                                                    onChange={(e) => setContactPhone(e.target.value)}
                                                    className="w-full p-2 border rounded"
                                                    placeholder="0962xxxxxx"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                <input
                                                    type="email"
                                                    value={contactEmail}
                                                    onChange={(e) => setContactEmail(e.target.value)}
                                                    className="w-full p-2 border rounded"
                                                    placeholder="email@example.com"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
    </div>
  );
};

export default BaidangDetail;
