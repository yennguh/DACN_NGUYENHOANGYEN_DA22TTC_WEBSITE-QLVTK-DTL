import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, MapPin, Package, Phone, Mail, ArrowLeft, Edit, Trash2, MessageCircle, Send, Heart, Reply } from 'lucide-react';
import { fetchPostById, deletePost, updatePost } from '../../api/posts.api';
import { fetchCommentsByPostId, createComment, updateComment, deleteComment, toggleLikeComment, replyComment } from '../../api/comments.api';
import { getImageUrl } from '../../utils/constant';
import { AuthContext } from '../../core/AuthContext';
import { jwtDecode } from 'jwt-decode';
import PrivacyImage from '../../components/PrivacyImage';

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

    // Comments state
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');
    const [replyingToId, setReplyingToId] = useState(null);
    const [replyContent, setReplyContent] = useState('');

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

    // Fetch comments
    useEffect(() => {
        const fetchComments = async () => {
            if (!id) return;
            setLoadingComments(true);
            try {
                const commentsData = await fetchCommentsByPostId(id);
                if (commentsData) {
                    setComments(commentsData);
                }
            } catch (error) {
                console.error('Error fetching comments:', error);
            } finally {
                setLoadingComments(false);
            }
        };

        fetchComments();
    }, [id]);

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

    // Comment handlers
    const handleCreateComment = async () => {
        if (!newComment.trim()) return;
        try {
            const payload = { postId: id, content: newComment.trim() };
            const createdComment = await createComment(payload);
            if (createdComment) {
                setComments(prev => [createdComment, ...prev]);
                setNewComment('');
            }
        } catch (error) {
            alert('Có lỗi khi đăng bình luận');
        }
    };

    const handleEditComment = (commentId, content) => {
        setEditingCommentId(commentId);
        setEditingCommentContent(content);
    };

    const handleSaveEditComment = async (commentId) => {
        if (!editingCommentContent.trim()) return;
        try {
            const updatedComment = await updateComment(commentId, { content: editingCommentContent.trim() });
            if (updatedComment) {
                setComments(prev => prev.map(c => c._id === commentId ? updatedComment : c));
                setEditingCommentId(null);
                setEditingCommentContent('');
            }
        } catch (error) {
            alert('Có lỗi khi cập nhật bình luận');
        }
    };

    const handleCancelEditComment = () => {
        setEditingCommentId(null);
        setEditingCommentContent('');
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
        try {
            await deleteComment(commentId);
            setComments(prev => prev.filter(c => c._id !== commentId));
        } catch (error) {
            alert('Có lỗi khi xóa bình luận');
        }
    };

    const handleLikeComment = async (commentId) => {
        if (!token) {
            alert('Vui lòng đăng nhập để thích bình luận');
            return;
        }
        try {
            const result = await toggleLikeComment(commentId);
            if (result?.data) {
                setComments(prev => prev.map(c => 
                    c._id === commentId ? { ...c, likes: result.data.likes } : c
                ));
            }
        } catch (error) {
            alert('Có lỗi khi thích bình luận');
        }
    };

    const handleReplyComment = async (parentId) => {
        if (!replyContent.trim()) return;
        try {
            const result = await replyComment(parentId, replyContent.trim());
            if (result?.data) {
                // Refresh comments
                const commentsData = await fetchCommentsByPostId(id);
                if (commentsData) setComments(commentsData);
                setReplyingToId(null);
                setReplyContent('');
            }
        } catch (error) {
            alert('Có lỗi khi trả lời bình luận');
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
            <div className="max-w-6xl mx-auto">
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

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    {/* User Header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden">
                                {user?.avatar ? (
                                    <img
                                        src={getImageUrl(user.avatar)}
                                        alt={user.fullname}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <span className="text-white font-bold">
                                        {user?.fullname?.substring(0, 1).toUpperCase() || 'U'}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{user?.fullname || 'Người dùng'}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {new Date(post.createdAt).toLocaleDateString('vi-VN', { 
                                        hour: '2-digit', 
                                        minute: '2-digit',
                                        day: '2-digit', 
                                        month: '2-digit', 
                                        year: 'numeric' 
                                    })}
                                </p>
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            post.category === 'lost' 
                                ? 'bg-red-100 text-red-600' 
                                : 'bg-emerald-100 text-emerald-600'
                        }`}>
                            {post.category === 'lost' ? '🔍 Thất lạc' : '✨ Nhặt được'}
                        </div>
                    </div>

                    {/* Title & Description */}
                    <div className="p-5">
                        <h1 className="text-2xl font-bold text-blue-600 mb-3">{post.title}</h1>
                        {post.description && (
                            <p className="text-gray-700 whitespace-pre-wrap">{post.description}</p>
                        )}
                    </div>

                    {/* Images - Làm mờ nhẹ cho người xem không phải chủ/admin */}
                    {post.images && post.images.length > 0 && (
                        <div>
                            <PrivacyImage
                                src={post.images[currentImageIndex]}
                                alt={post.title}
                                className="w-full max-h-[600px] object-contain bg-gray-100"
                                postOwnerId={post.userId}
                            />
                            
                            {/* Thumbnails */}
                            {post.images.length > 1 && (
                                <div className="flex gap-2 p-4 bg-gray-50 overflow-x-auto">
                                    {post.images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                                index === currentImageIndex 
                                                    ? 'border-blue-500 ring-2 ring-blue-200' 
                                                    : 'border-gray-200 hover:border-gray-400'
                                            }`}
                                        >
                                            <PrivacyImage
                                                src={img}
                                                alt={`Ảnh ${index + 1}`}
                                                className="w-full h-full object-cover"
                                                postOwnerId={post.userId}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Meta Tags */}
                    <div className="p-5 border-t border-gray-100">
                        <div className="flex flex-wrap gap-3 mb-4">
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full">
                                <Package className="w-4 h-4" />
                                {post.itemType}
                            </span>
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full">
                                <MapPin className="w-4 h-4" />
                                {post.location}
                            </span>
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
                                            
                                            {/* Nút liên hệ - chuyển đến trang contact */}
                                            {!isOwner && token && (
                                                <button
                                                    onClick={() => navigate('/lien-he', { 
                                                        state: { 
                                                            fromPost: true,
                                                            postId: id,
                                                            postTitle: post.title,
                                                            postOwner: user?.fullname || 'Người đăng'
                                                        } 
                                                    })}
                                                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                >
                                                    <MessageCircle className="w-5 h-5" />
                                                    Liên hệ với quản trị viên
                                                </button>
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

                        {/* Comments Section */}
                        <div className="border-t pt-6 mt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <MessageCircle className="w-5 h-5" />
                                <h2 className="text-xl font-semibold">Bình luận ({comments.length})</h2>
                            </div>

                            {/* Comment Input */}
                            {token && (
                                <div className="mb-6">
                                    <div className="flex gap-3">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Viết bình luận của bạn..."
                                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            rows="3"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleCreateComment();
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={handleCreateComment}
                                            disabled={!newComment.trim()}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            <Send className="w-4 h-4" />
                                            Đăng
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Comments List */}
                            {loadingComments ? (
                                <div className="text-center py-4">Đang tải bình luận...</div>
                            ) : comments.length > 0 ? (
                                <div className="space-y-4">
                                    {comments.filter(c => !c.parentId).map((comment) => (
                                        <div key={comment._id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                {comment.user?.avatar ? (
                                                    <img
                                                        src={getImageUrl(comment.user.avatar)}
                                                        alt={comment.user.fullname}
                                                        className="w-10 h-10 rounded-full object-cover border"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                                                        {comment.user?.fullname ? comment.user.fullname.substring(0,2).toUpperCase() : 'U'}
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-gray-900">
                                                            {comment.user?.fullname || 'Người dùng'}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                                                        </span>
                                                    </div>

                                                    {editingCommentId === comment._id ? (
                                                        <div className="space-y-2">
                                                            <textarea
                                                                value={editingCommentContent}
                                                                onChange={(e) => setEditingCommentContent(e.target.value)}
                                                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                                rows="3"
                                                            />
                                                            <div className="flex gap-2">
                                                                <button onClick={() => handleSaveEditComment(comment._id)} className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">Lưu</button>
                                                                <button onClick={handleCancelEditComment} className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300">Hủy</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                                                            <div className="flex items-center gap-4 mt-2">
                                                                <button
                                                                    onClick={() => handleLikeComment(comment._id)}
                                                                    className={`flex items-center gap-1 text-sm ${comment.likes?.includes(authUser?._id) ? 'text-pink-600' : 'text-gray-500 hover:text-pink-600'}`}
                                                                >
                                                                    <Heart className={`w-4 h-4 ${comment.likes?.includes(authUser?._id) ? 'fill-current' : ''}`} />
                                                                    {comment.likes?.length || 0}
                                                                </button>
                                                                {token && (
                                                                    <button
                                                                        onClick={() => setReplyingToId(replyingToId === comment._id ? null : comment._id)}
                                                                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"
                                                                    >
                                                                        <Reply className="w-4 h-4" />
                                                                        Trả lời
                                                                    </button>
                                                                )}
                                                                {token && (comment.userId === authUser?._id || isAdmin) && (
                                                                    <>
                                                                        <button onClick={() => handleEditComment(comment._id, comment.content)} className="text-sm text-blue-600 hover:text-blue-800">Sửa</button>
                                                                        <button onClick={() => handleDeleteComment(comment._id)} className="text-sm text-red-600 hover:text-red-800">Xóa</button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Reply Input */}
                                                    {replyingToId === comment._id && (
                                                        <div className="mt-3 flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={replyContent}
                                                                onChange={(e) => setReplyContent(e.target.value)}
                                                                placeholder="Viết trả lời..."
                                                                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                                                onKeyDown={(e) => { if (e.key === 'Enter') handleReplyComment(comment._id); }}
                                                            />
                                                            <button onClick={() => handleReplyComment(comment._id)} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Gửi</button>
                                                        </div>
                                                    )}

                                                    {/* Replies */}
                                                    {comments.filter(r => r.parentId === comment._id).map((reply) => (
                                                        <div key={reply._id} className="mt-3 ml-4 pl-4 border-l-2 border-gray-200">
                                                            <div className="flex items-start gap-2">
                                                                {reply.user?.avatar ? (
                                                                    <img src={getImageUrl(reply.user.avatar)} alt={reply.user.fullname} className="w-8 h-8 rounded-full object-cover border" />
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-semibold">
                                                                        {reply.user?.fullname ? reply.user.fullname.substring(0,2).toUpperCase() : 'U'}
                                                                    </div>
                                                                )}
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-medium text-gray-900 text-sm">{reply.user?.fullname || 'Người dùng'}</span>
                                                                        <span className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleDateString('vi-VN')}</span>
                                                                    </div>
                                                                    <p className="text-gray-700 text-sm">{reply.content}</p>
                                                                    <div className="flex items-center gap-3 mt-1">
                                                                        <button onClick={() => handleLikeComment(reply._id)} className={`flex items-center gap-1 text-xs ${reply.likes?.includes(authUser?._id) ? 'text-pink-600' : 'text-gray-500 hover:text-pink-600'}`}>
                                                                            <Heart className={`w-3 h-3 ${reply.likes?.includes(authUser?._id) ? 'fill-current' : ''}`} />
                                                                            {reply.likes?.length || 0}
                                                                        </button>
                                                                        {token && (
                                                                            <button
                                                                                onClick={() => setReplyingToId(replyingToId === reply._id ? null : reply._id)}
                                                                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"
                                                                            >
                                                                                <Reply className="w-3 h-3" />
                                                                                Trả lời
                                                                            </button>
                                                                        )}
                                                                        {token && (reply.userId === authUser?._id || isAdmin) && (
                                                                            <button onClick={() => handleDeleteComment(reply._id)} className="text-xs text-red-600 hover:text-red-800">Xóa</button>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    {/* Reply Input for nested reply */}
                                                                    {replyingToId === reply._id && (
                                                                        <div className="mt-2 flex gap-2">
                                                                            <input
                                                                                type="text"
                                                                                value={replyContent}
                                                                                onChange={(e) => setReplyContent(e.target.value)}
                                                                                placeholder={`Trả lời ${reply.user?.fullname || 'người dùng'}...`}
                                                                                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                                                                onKeyDown={(e) => { if (e.key === 'Enter') handleReplyComment(comment._id); }}
                                                                            />
                                                                            <button onClick={() => handleReplyComment(comment._id)} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Gửi</button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    Chưa có bình luận nào. {token ? 'Hãy là người đầu tiên bình luận!' : 'Đăng nhập để bình luận.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BaidangDetail;
