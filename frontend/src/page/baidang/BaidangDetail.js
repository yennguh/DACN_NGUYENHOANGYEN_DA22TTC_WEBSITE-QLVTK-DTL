import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, MapPin, Package, Phone, Mail, ArrowLeft, Edit, Trash2, MessageCircle, Send, Heart, Reply, Image, X, Ban, Share2 } from 'lucide-react';
import { fetchPostById, deletePost, updatePost, sharePost } from '../../api/posts.api';
import { fetchCommentsByPostId, createComment, updateComment, deleteComment, toggleLikeComment, replyComment } from '../../api/comments.api';
import { createReport } from '../../api/reports.api';
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
    const [isFavorite, setIsFavorite] = useState(false);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [commentImage, setCommentImage] = useState(null);
    const [commentImagePreview, setCommentImagePreview] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');
    const [replyingToId, setReplyingToId] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [editingContact, setEditingContact] = useState(false);
    const [contactPhone, setContactPhone] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [editingPost, setEditingPost] = useState(false);
    const [editDescription, setEditDescription] = useState('');
    const [editItemType, setEditItemType] = useState('');
    const [editLocation, setEditLocation] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [returnStatus, setReturnStatus] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [submittingReport, setSubmittingReport] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareCaption, setShareCaption] = useState('');
    const [submittingShare, setSubmittingShare] = useState(false);
    const imageInputRef = useRef(null);

    useEffect(() => {
        if (id) {
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            setIsFavorite(favorites.includes(id));
        }
    }, [id]);

    const handleToggleFavorite = useCallback(() => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        if (isFavorite) {
            localStorage.setItem('favorites', JSON.stringify(favorites.filter(fid => fid !== id)));
            setIsFavorite(false);
        } else {
            localStorage.setItem('favorites', JSON.stringify([...favorites, id]));
            setIsFavorite(true);
        }
    }, [id, isFavorite]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const postData = await fetchPostById(id);
                if (postData) {
                    setPost(postData);
                    if (token) {
                        try {
                            const decoded = jwtDecode(token);
                            setIsOwner(postData.userId === decoded._id);
                            setIsAdmin(decoded.roles?.includes('admin') || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']?.includes('admin'));
                        } catch (err) { /* ignore */ }
                    }
                }
            } catch (error) { console.error('Error fetching post:', error); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [id, token]);

    useEffect(() => { if (post?.user) setUser(post.user); }, [post]);
    useEffect(() => {
        if (authUser && post?.user && post.user._id === authUser._id) {
            setPost(prev => ({ ...prev, user: { ...prev.user, avatar: authUser.avatar, fullname: authUser.fullname } }));
            setUser(authUser);
        }
    }, [authUser, post]);

    useEffect(() => {
        const fetchComments = async () => {
            if (!id) return;
            setLoadingComments(true);
            try {
                const data = await fetchCommentsByPostId(id);
                if (data) setComments(data);
            } catch (error) { console.error('Error:', error); }
            finally { setLoadingComments(false); }
        };
        fetchComments();
    }, [id]);

    useEffect(() => {
        if (post?.contactInfo) {
            setContactPhone(post.contactInfo.phone || '');
            setContactEmail(post.contactInfo.email || '');
        }
        if (post) {
            setEditDescription(post.description || '');
            setEditItemType(post.itemType || '');
            setEditLocation(post.location || '');
            setEditCategory(post.category || '');
            setReturnStatus(post.returnStatus || false);
        }
    }, [post]);

    const handleSaveContact = async () => {
        if (!isOwner) return;
        try {
            await updatePost(id, { contactInfo: { phone: contactPhone, email: contactEmail } });
            const refreshed = await fetchPostById(id);
            setPost(refreshed);
            alert('Cập nhật thành công');
            setEditingContact(false);
        } catch (err) { alert('Có lỗi xảy ra'); }
    };

    const handleSavePost = async () => {
        if (!isOwner) return;
        try {
            await updatePost(id, {
                description: editDescription,
                itemType: editItemType,
                location: editLocation,
                category: editCategory,
                contactInfo: { phone: contactPhone, email: contactEmail }
            });
            const refreshed = await fetchPostById(id);
            setPost(refreshed);
            alert('Cập nhật thành công');
            setEditingPost(false);
        } catch (err) { alert('Có lỗi xảy ra'); }
    };

    const handleToggleReturnStatus = async () => {
        if (!isOwner) return;
        try {
            const newStatus = !returnStatus;
            await updatePost(id, { returnStatus: newStatus });
            setReturnStatus(newStatus);
            setPost(prev => ({ ...prev, returnStatus: newStatus }));
        } catch (err) { alert('Có lỗi xảy ra'); }
    };

    const handleSubmitReport = async () => {
        if (!reportReason.trim()) { alert('Vui lòng nhập lý do tố cáo'); return; }
        setSubmittingReport(true);
        try {
            await createReport({ postId: id, postTitle: post.title, reason: reportReason.trim() });
            alert('Tố cáo đã được gửi đến quản trị viên');
            setShowReportModal(false);
            setReportReason('');
        } catch (err) { alert('Có lỗi xảy ra khi gửi tố cáo'); }
        finally { setSubmittingReport(false); }
    };

    const handleCancelEditPost = () => {
        setEditingPost(false);
        setEditDescription(post.description || '');
        setEditItemType(post.itemType || '');
        setEditLocation(post.location || '');
        setEditCategory(post.category || '');
        setContactPhone(post.contactInfo?.phone || '');
        setContactEmail(post.contactInfo?.email || '');
    };

    const handleDelete = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa?')) return;
        try {
            await deletePost(id);
            alert('Xóa thành công');
            navigate(isAdmin ? '/admin' : '/');
        } catch (error) { alert('Có lỗi xảy ra'); }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { alert('Ảnh không được vượt quá 5MB'); return; }
            setCommentImage(file);
            setCommentImagePreview(URL.createObjectURL(file));
        }
    };

    const removeCommentImage = () => {
        setCommentImage(null);
        setCommentImagePreview(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    const handleCreateComment = async () => {
        if (!newComment.trim() && !commentImage) return;
        setSubmittingComment(true);
        try {
            const payload = { postId: id, content: newComment.trim() || ' ' };
            if (commentImage) payload.image = commentImage;
            await createComment(payload);
            const data = await fetchCommentsByPostId(id);
            if (data) setComments(data);
            setNewComment('');
            removeCommentImage();
        } catch (error) { alert('Có lỗi khi đăng bình luận'); }
        finally { setSubmittingComment(false); }
    };

    const handleEditComment = (cid, content) => { setEditingCommentId(cid); setEditingCommentContent(content); };
    const handleCancelEditComment = () => { setEditingCommentId(null); setEditingCommentContent(''); };

    const handleSaveEditComment = async (cid) => {
        if (!editingCommentContent.trim()) return;
        try {
            await updateComment(cid, { content: editingCommentContent.trim() });
            setComments(prev => prev.map(c => c._id === cid ? { ...c, content: editingCommentContent.trim() } : c));
            handleCancelEditComment();
        } catch (error) { alert('Có lỗi'); }
    };

    const handleDeleteComment = async (cid) => {
        if (!window.confirm('Xóa bình luận này?')) return;
        try {
            await deleteComment(cid);
            setComments(prev => prev.filter(c => c._id !== cid));
        } catch (error) { alert('Có lỗi'); }
    };

    const handleLikeComment = async (cid) => {
        if (!token) { alert('Vui lòng đăng nhập'); return; }
        try {
            const result = await toggleLikeComment(cid);
            if (result?.data) setComments(prev => prev.map(c => c._id === cid ? { ...c, likes: result.data.likes } : c));
        } catch (error) { alert('Có lỗi'); }
    };

    const handleReplyComment = async (parentId) => {
        if (!replyContent.trim()) return;
        try {
            await replyComment(parentId, replyContent.trim());
            const data = await fetchCommentsByPostId(id);
            if (data) setComments(data);
            setReplyingToId(null);
            setReplyContent('');
        } catch (error) { alert('Có lỗi'); }
    };

    const Avatar = ({ src, name, size = 'md' }) => {
        const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
        const [err, setErr] = useState(false);
        if (src && !err) return <img src={getImageUrl(src)} alt="" className={`${sizes[size]} rounded-full object-cover border flex-shrink-0`} onError={() => setErr(true)} />;
        return <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0`}>{name?.charAt(0).toUpperCase() || 'U'}</div>;
    };

    // Component hiển thị card bài gốc với xử lý lỗi ảnh - ẢNH ĐƯỢC BLUR BẰNG AI
    const OriginalPostCard = ({ originalPost, onNavigate }) => {
        const [avatarErr, setAvatarErr] = useState(false);
        
        // Lấy postOwnerId của bài gốc để xác định ai được xem ảnh rõ
        const originalPostOwnerId = originalPost.userId || originalPost.user?._id;
        
        return (
            <div 
                onClick={onNavigate}
                className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
            >
                <div className="p-4">
                    {/* Header bài gốc */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {originalPost.authorAvatar && !avatarErr ? (
                                <img src={getImageUrl(originalPost.authorAvatar)} alt="" className="w-full h-full object-cover" onError={() => setAvatarErr(true)} />
                            ) : (
                                <span className="text-white text-sm font-bold">{originalPost.authorFullname?.charAt(0)?.toUpperCase() || 'U'}</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900">{originalPost.authorFullname || 'Người dùng'}</p>
                            <p className="text-xs text-gray-500">{new Date(originalPost.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${originalPost.category === 'lost' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {originalPost.category === 'lost' ? '🔍 Thất lạc' : '✨ Nhặt được'}
                        </span>
                    </div>
                    
                    {/* Nội dung bài gốc */}
                    <h4 className="font-bold text-blue-600 mb-2">{originalPost.title}</h4>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-3">{originalPost.description}</p>
                    
                    {/* Ảnh bài gốc - SỬ DỤNG PrivacyImage ĐỂ BLUR */}
                    {originalPost.images?.[0] && (
                        <div className="rounded-lg overflow-hidden mb-3 bg-gray-100">
                            <PrivacyImage 
                                src={originalPost.images[0]} 
                                alt="" 
                                className="w-full h-48 object-cover" 
                                blur={true}
                                postOwnerId={originalPostOwnerId}
                            />
                        </div>
                    )}
                    
                    {/* Tags */}
                    <div className="flex gap-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded flex items-center gap-1">
                            <Package className="w-3 h-3" /> {originalPost.itemType}
                        </span>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {originalPost.location}
                        </span>
                    </div>
                </div>
                <div className="px-4 py-2 bg-gray-100 text-center text-sm text-blue-600 font-medium">
                    Nhấn để xem bài đăng gốc →
                </div>
            </div>
        );
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-xl">Đang tải...</div></div>;
    if (!post) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><h2 className="text-2xl font-bold mb-4">Không tìm thấy bài đăng</h2><Link to="/" className="text-blue-600 hover:underline">Quay về trang chủ</Link></div></div>;


    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-800"><ArrowLeft className="w-5 h-5" /> Quay lại</button>
                </div>

                {(isOwner || isAdmin) && (
                    <div className="flex gap-2 mb-4">
                        {/* Không cho chỉnh sửa bài chia sẻ */}
                        {isOwner && !editingPost && !post?.isShared && <button onClick={() => setEditingPost(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Edit className="w-4 h-4" /> Chỉnh sửa</button>}
                        {isOwner && editingPost && (
                            <>
                                <button onClick={handleSavePost} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Lưu</button>
                                <button onClick={handleCancelEditPost} className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Hủy</button>
                            </>
                        )}
                        {isAdmin && !isOwner && !post?.isShared && <Link to={`/admin/posts/${id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><Edit className="w-4 h-4" /> Chỉnh sửa (Admin)</Link>}
                        <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><Trash2 className="w-4 h-4" /> Xóa</button>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    {/* Header - Người chia sẻ hoặc người đăng */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <Link to={`/profile/${post.userId}`} className="cursor-pointer hover:opacity-80 transition">
                                <Avatar src={user?.avatar} name={user?.fullname} size="lg" />
                            </Link>
                            <div>
                                <Link to={`/profile/${post.userId}`} className="font-semibold text-gray-900 hover:text-blue-600 transition">
                                    {user?.fullname || 'Người dùng'}
                                    {post.isShared && <span className="text-gray-500 font-normal text-sm ml-2">đã chia sẻ bài viết</span>}
                                </Link>
                                <p className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(post.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                            </div>
                        </div>
                        {/* Chỉ hiện badge category và return status nếu KHÔNG phải bài chia sẻ */}
                        {!post.isShared && (
                            <div className="flex items-center gap-2">
                                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${post.category === 'lost' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>{post.category === 'lost' ? '🔍 Thất lạc' : '✨ Nhặt được'}</div>
                                
                                {/* Badge trạng thái đã tìm được/đã trả */}
                                {/* Chủ bài/Admin: hiện checkbox + badge */}
                                {(isOwner || isAdmin) && (
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={returnStatus} 
                                            onChange={handleToggleReturnStatus}
                                            className="w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-500"
                                        />
                                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                            returnStatus 
                                                ? 'bg-green-500 text-white' 
                                                : 'bg-gray-200 text-gray-500'
                                        }`}>
                                            {post.category === 'lost' ? 'Đã tìm được' : 'Đã trả lại'}
                                        </span>
                                    </label>
                                )}
                                {/* Người khác: chỉ thấy badge khi đã tick */}
                                {!isOwner && !isAdmin && returnStatus && (
                                    <div className="px-4 py-2 rounded-full text-sm font-semibold bg-green-500 text-white flex items-center gap-2">
                                        <span className="text-white">✓</span>
                                        {post.category === 'lost' ? 'Đã tìm được' : 'Đã trả lại'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Nội dung bài đăng */}
                    <div className="p-5">
                        {/* Nếu là bài chia sẻ: chỉ hiện shareComment (không hiện title) */}
                        {post.isShared ? (
                            <>
                                {/* Lời bình của người chia sẻ */}
                                {post.shareComment && (
                                    <p className="text-gray-700 whitespace-pre-wrap mb-4">{post.shareComment}</p>
                                )}
                                
                                {/* Card bài đăng gốc - click để chuyển đến bài gốc */}
                                {post.originalPost && (
                                    <OriginalPostCard 
                                        originalPost={post.originalPost} 
                                        sharedFrom={post.sharedFrom}
                                        onNavigate={() => navigate(`/baidang/${post.originalPost._id || post.sharedFrom}`)}
                                    />
                                )}
                            </>
                        ) : (
                            <>
                                {/* Bài đăng thường */}
                                <h1 className="text-2xl font-bold text-blue-600 mb-3">{post.title}</h1>
                                {editingPost ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Mô tả</label>
                                            <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full p-3 border rounded-lg" rows="4" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Loại đồ vật</label>
                                                <input type="text" value={editItemType} onChange={(e) => setEditItemType(e.target.value)} className="w-full p-2 border rounded" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Vị trí</label>
                                                <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="w-full p-2 border rounded" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Loại bài đăng</label>
                                            <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full p-2 border rounded">
                                                <option value="lost">Thất lạc</option>
                                                <option value="found">Nhặt được</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                                                <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full p-2 border rounded" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Email</label>
                                                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full p-2 border rounded" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    post.description && <p className="text-gray-700 whitespace-pre-wrap">{post.description}</p>
                                )}
                            </>
                        )}
                    </div>

                    {/* Chỉ hiện phần thông tin chi tiết và liên hệ nếu KHÔNG phải bài chia sẻ */}
                    {!editingPost && !post.isShared && (
                    <div className="p-5 border-t border-gray-100">
                        <div className="flex flex-wrap gap-3 mb-4">
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full"><Package className="w-4 h-4" /> {post.itemType}</span>
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full"><MapPin className="w-4 h-4" /> {post.location}</span>
                        </div>

                        {(post.contactInfo?.phone || post.contactInfo?.email || user) && (
                            <div className="border-t pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold">Thông tin liên hệ</h2>
                                    {isOwner && !editingContact && <button onClick={() => setEditingContact(true)} className="text-sm px-3 py-1 bg-yellow-100 text-yellow-800 rounded">Chỉnh sửa</button>}
                                    {isOwner && editingContact && (
                                        <div className="flex gap-2">
                                            <button onClick={handleSaveContact} className="text-sm px-3 py-1 bg-green-600 text-white rounded">Lưu</button>
                                            <button onClick={() => { setEditingContact(false); setContactPhone(post.contactInfo?.phone || ''); setContactEmail(post.contactInfo?.email || ''); }} className="text-sm px-3 py-1 bg-gray-200 rounded">Hủy</button>
                                        </div>
                                    )}
                                </div>
                                {!editingContact ? (
                                    <div className="flex flex-wrap items-center gap-6">
                                        {post.contactInfo?.phone && (
                                            <a href={`tel:${post.contactInfo.phone}`} className="flex items-center gap-2 text-gray-700 hover:text-blue-600 text-base">
                                                <Phone className="w-5 h-5" /> {post.contactInfo.phone}
                                            </a>
                                        )}
                                        {post.contactInfo?.email && (
                                            <a href={`mailto:${post.contactInfo.email}`} className="flex items-center gap-2 text-gray-700 hover:text-blue-600 text-base">
                                                <Mail className="w-5 h-5" /> {post.contactInfo.email}
                                            </a>
                                        )}
                                        {!isOwner && token && (
                                            <button onClick={() => navigate('/lien-he', { state: { fromPost: true, postId: id, postTitle: post.title, postOwner: user?.fullname } })} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                                <MessageCircle className="w-5 h-5" /> Liên hệ quản trị viên
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-medium mb-1">Số điện thoại</label><input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full p-2 border rounded" /></div>
                                        <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full p-2 border rounded" /></div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    )}

                    {/* Chỉ hiện ảnh nếu KHÔNG phải bài chia sẻ */}
                    {!post.isShared && post.images?.length > 0 && (
                        <div className="relative">
                            {token && !isOwner && !post.user?.roles?.includes('admin') && (
                                <button onClick={() => setShowReportModal(true)} className="absolute top-3 right-3 z-10 p-2 bg-white/90 hover:bg-red-50 rounded-full shadow-md transition-all" title="Tố cáo bài đăng">
                                    <Ban className="w-5 h-5 text-red-500" />
                                </button>
                            )}
                            <PrivacyImage src={post.images[currentImageIndex]} alt={post.title} className="w-full max-h-[600px] object-contain bg-gray-100" postOwnerId={post.userId} />
                            {post.images.length > 1 && (
                                <div className="flex gap-2 p-4 bg-gray-50 overflow-x-auto">
                                    {post.images.map((img, i) => (
                                        <button key={i} onClick={() => setCurrentImageIndex(i)} className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${i === currentImageIndex ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}>
                                            <PrivacyImage src={img} alt="" className="w-full h-full object-cover" postOwnerId={post.userId} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="p-5 border-t border-gray-100">
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <button onClick={handleToggleFavorite} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${isFavorite ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} /> {isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
                            </button>
                            
                            {/* Nút chia sẻ - không cho chia sẻ bài chia sẻ */}
                            {token && !isOwner && !post.isShared && (
                                <button onClick={() => setShowShareModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200">
                                    <Share2 className="w-5 h-5" /> Chia sẻ
                                </button>
                            )}
                        </div>

                        <div className="border-t pt-6 mt-2">
                            <div className="flex items-center gap-2 mb-4"><MessageCircle className="w-5 h-5" /><h2 className="text-xl font-semibold">Bình luận ({comments.length})</h2></div>

                            {token && (
                                <div className="mb-6">
                                    <div className="flex gap-3">
                                        <Avatar src={authUser?.avatar} name={authUser?.fullname} size="md" />
                                        <div className="flex-1">
                                            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Viết bình luận..." className="w-full p-3 border rounded-lg resize-none" rows="3" />
                                            {commentImagePreview && (
                                                <div className="mt-2 relative inline-block">
                                                    <img src={commentImagePreview} alt="Preview" className="max-h-32 rounded-lg border" />
                                                    <button onClick={removeCommentImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X className="w-4 h-4" /></button>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 mt-2">
                                                <input type="file" ref={imageInputRef} accept="image/*" onChange={handleImageSelect} className="hidden" />
                                                <button type="button" onClick={() => imageInputRef.current?.click()} className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Image className="w-5 h-5" /> Thêm ảnh</button>
                                                <button onClick={handleCreateComment} disabled={(!newComment.trim() && !commentImage) || submittingComment} className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 flex items-center gap-2"><Send className="w-4 h-4" /> {submittingComment ? 'Đang gửi...' : 'Đăng'}</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {loadingComments ? <div className="text-center py-4">Đang tải...</div> : comments.length > 0 ? (
                                <div className="space-y-4">
                                    {comments.filter(c => !c.parentId).map((cmt) => (
                                        <div key={cmt._id} className="border rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <Avatar src={cmt.user?.avatar} name={cmt.user?.fullname} size="md" />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium">{cmt.user?.fullname || 'Người dùng'}</span>
                                                        <span className="text-sm text-gray-500">{new Date(cmt.createdAt).toLocaleDateString('vi-VN')}</span>
                                                    </div>
                                                    {editingCommentId === cmt._id ? (
                                                        <div className="space-y-2">
                                                            <textarea value={editingCommentContent} onChange={(e) => setEditingCommentContent(e.target.value)} className="w-full p-2 border rounded" rows="3" />
                                                            <div className="flex gap-2">
                                                                <button onClick={() => handleSaveEditComment(cmt._id)} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Lưu</button>
                                                                <button onClick={handleCancelEditComment} className="px-3 py-1 bg-gray-200 rounded text-sm">Hủy</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p className="text-gray-700 whitespace-pre-wrap">{cmt.content}</p>
                                                            {cmt.image && <img src={getImageUrl(cmt.image)} alt="" className="max-w-[200px] max-h-[150px] rounded-lg border mt-2 object-cover" />}
                                                            <div className="flex items-center gap-4 mt-2">
                                                                <button onClick={() => handleLikeComment(cmt._id)} className={`flex items-center gap-1 text-sm ${cmt.likes?.includes(authUser?._id) ? 'text-pink-600' : 'text-gray-500'}`}><Heart className={`w-4 h-4 ${cmt.likes?.includes(authUser?._id) ? 'fill-current' : ''}`} /> {cmt.likes?.length || 0}</button>
                                                                {token && <button onClick={() => setReplyingToId(replyingToId === cmt._id ? null : cmt._id)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"><Reply className="w-4 h-4" /> Trả lời</button>}
                                                                {token && cmt.userId === authUser?._id && <button onClick={() => handleEditComment(cmt._id, cmt.content)} className="text-sm text-blue-600">Sửa</button>}
                                                                {token && (cmt.userId === authUser?._id || isOwner || isAdmin) && <button onClick={() => handleDeleteComment(cmt._id)} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {replyingToId === cmt._id && (
                                                        <div className="mt-3 flex gap-2">
                                                            <input type="text" value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="Viết trả lời..." className="flex-1 p-2 border rounded-lg text-sm" onKeyDown={(e) => { if (e.key === 'Enter') handleReplyComment(cmt._id); }} />
                                                            <button onClick={() => handleReplyComment(cmt._id)} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">Gửi</button>
                                                        </div>
                                                    )}
                                                    {comments.filter(r => r.parentId === cmt._id).map((reply) => (
                                                        <div key={reply._id} className="mt-3 ml-4 pl-4 border-l-2 border-gray-200">
                                                            <div className="flex items-start gap-2">
                                                                <Avatar src={reply.user?.avatar} name={reply.user?.fullname} size="sm" />
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-medium text-sm">{reply.user?.fullname || 'Người dùng'}</span>
                                                                        <span className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleDateString('vi-VN')}</span>
                                                                    </div>
                                                                    <p className="text-gray-700 text-sm">{reply.content}</p>
                                                                    {reply.image && <img src={getImageUrl(reply.image)} alt="" className="max-w-[150px] max-h-[100px] rounded-lg border mt-1 object-cover" />}
                                                                    <div className="flex items-center gap-3 mt-1">
                                                                        <button onClick={() => handleLikeComment(reply._id)} className={`flex items-center gap-1 text-xs ${reply.likes?.includes(authUser?._id) ? 'text-pink-600' : 'text-gray-500'}`}><Heart className={`w-3 h-3 ${reply.likes?.includes(authUser?._id) ? 'fill-current' : ''}`} /> {reply.likes?.length || 0}</button>
                                                                        {token && <button onClick={() => setReplyingToId(replyingToId === reply._id ? null : reply._id)} className="text-xs text-gray-500 hover:text-blue-600"><Reply className="w-3 h-3 inline" /> Trả lời</button>}
                                                                        {token && (reply.userId === authUser?._id || isOwner || isAdmin) && <button onClick={() => handleDeleteComment(reply._id)} className="flex items-center text-red-500 hover:text-red-700"><X className="w-3 h-3" /></button>}
                                                                    </div>
                                                                    {replyingToId === reply._id && (
                                                                        <div className="mt-2 flex gap-2">
                                                                            <input type="text" value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder={`Trả lời ${reply.user?.fullname}...`} className="flex-1 p-2 border rounded-lg text-sm" onKeyDown={(e) => { if (e.key === 'Enter') handleReplyComment(cmt._id); }} />
                                                                            <button onClick={() => handleReplyComment(cmt._id)} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">Gửi</button>
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
                            ) : <div className="text-center py-8 text-gray-500">Chưa có bình luận. {token ? 'Hãy là người đầu tiên!' : 'Đăng nhập để bình luận.'}</div>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Tố cáo */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
                                <Ban className="w-6 h-6" /> Tố cáo bài đăng
                            </h3>
                            <button onClick={() => setShowReportModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-gray-600 mb-4">Bạn đang tố cáo bài đăng: <span className="font-medium">{post.title}</span></p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Lý do tố cáo</label>
                            <textarea
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                                placeholder="Nhập lý do tố cáo bài đăng này..."
                                className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
                                rows="4"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowReportModal(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Hủy</button>
                            <button onClick={handleSubmitReport} disabled={submittingReport || !reportReason.trim()} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300">
                                {submittingReport ? 'Đang gửi...' : 'Gửi tố cáo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Chia sẻ bài đăng */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
                            <h3 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                                <Share2 className="w-6 h-6" /> Chia sẻ bài đăng
                            </h3>
                            <button onClick={() => { setShowShareModal(false); setShareCaption(''); }} className="p-1 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-4">
                            {/* Caption của người chia sẻ */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Viết gì đó về bài đăng này...</label>
                                <textarea
                                    value={shareCaption}
                                    onChange={(e) => setShareCaption(e.target.value)}
                                    placeholder="Chia sẻ suy nghĩ của bạn về bài đăng này..."
                                    className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                                    rows="3"
                                />
                            </div>

                            {/* Preview bài đăng gốc */}
                            <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                                <div className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                                            {user?.fullname?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{user?.fullname || 'Người dùng'}</p>
                                            <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
                                        </div>
                                        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${post.category === 'lost' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {post.category === 'lost' ? '🔍 Thất lạc' : '✨ Nhặt được'}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-blue-600 mb-2">{post.title}</h4>
                                    <p className="text-gray-600 text-sm line-clamp-3">{post.description}</p>
                                    {post.images?.[0] && (
                                        <div className="mt-3 rounded-lg overflow-hidden">
                                            <img src={getImageUrl(post.images[0])} alt="" className="w-full h-48 object-cover" />
                                        </div>
                                    )}
                                    <div className="flex gap-2 mt-3">
                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">{post.itemType}</span>
                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">{post.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white p-4 border-t flex gap-3">
                            <button onClick={() => { setShowShareModal(false); setShareCaption(''); }} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                                Hủy
                            </button>
                            <button 
                                onClick={async () => {
                                    setSubmittingShare(true);
                                    try {
                                        // Gọi API chia sẻ bài đăng
                                        await sharePost(post._id, shareCaption.trim());
                                        alert('Đã chia sẻ bài đăng thành công!');
                                        setShowShareModal(false);
                                        setShareCaption('');
                                    } catch (err) {
                                        alert('Có lỗi xảy ra khi chia sẻ');
                                    } finally {
                                        setSubmittingShare(false);
                                    }
                                }} 
                                disabled={submittingShare}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
                            >
                                <Share2 className="w-4 h-4" />
                                {submittingShare ? 'Đang chia sẻ...' : 'Chia sẻ ngay'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BaidangDetail;