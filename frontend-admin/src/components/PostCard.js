import { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Clock, MapPin, Package, LayoutGrid, Send, Eye, Heart } from 'lucide-react';
import { AuthContext } from '../core/AuthContext';
import { getImageUrl } from '../utils/constant';
import PrivacyImage from './PrivacyImage';
import { createComment } from '../api/comments.api';

// Format thời gian kiểu Facebook (vd: 2 giờ, 3 ngày)
const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;
    return date.toLocaleDateString('vi-VN');
};

const PostCard = ({ item }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { token, user } = useContext(AuthContext);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    // Kiểm tra trạng thái yêu thích từ localStorage
    useEffect(() => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.includes(item._id));
    }, [item._id]);

    const handleToggleFavorite = (e) => {
        e.stopPropagation();
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        if (isFavorite) {
            const newFavorites = favorites.filter(id => id !== item._id);
            localStorage.setItem('favorites', JSON.stringify(newFavorites));
            setIsFavorite(false);
        } else {
            favorites.push(item._id);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            setIsFavorite(true);
        }
    };

    const handleViewDetail = () => {
        if (token) {
            navigate(`/baidang/${item._id}`);
        } else {
            // Lưu trang hiện tại để sau khi đăng nhập quay lại
            navigate('/login', { state: { from: location } });
        }
    };

    // Click vào bài gốc trong bài chia sẻ
    const handleViewOriginalPost = (e) => {
        e.stopPropagation();
        if (token && item.originalPost?._id) {
            navigate(`/baidang/${item.originalPost._id}`);
        } else if (token && item.sharedFrom) {
            navigate(`/baidang/${item.sharedFrom}`);
        } else {
            navigate('/login', { state: { from: location } });
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!commentText.trim() || !token) return;
        
        setSubmitting(true);
        try {
            const result = await createComment({
                postId: item._id,
                content: commentText.trim()
            });
            if (result) {
                // Thêm comment mới vào danh sách với thông tin user hiện tại
                setComments(prev => [...prev, {
                    _id: result._id || Date.now(),
                    content: commentText.trim(),
                    user: user,
                    createdAt: new Date().toISOString()
                }]);
                setCommentText('');
            }
        } catch (error) {
            console.error('Lỗi gửi bình luận:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // Component Avatar với xử lý lỗi và link đến profile
    const Avatar = ({ src, name, size = 'md', userId }) => {
        const [imgError, setImgError] = useState(false);
        const sizes = { sm: 'w-9 h-9 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-12 h-12 text-base' };
        const initial = name?.substring(0, 1).toUpperCase() || 'U';
        
        const avatarContent = src && !imgError ? (
            <img 
                src={getImageUrl(src)} 
                alt="" 
                className="w-full h-full object-cover" 
                onError={() => setImgError(true)}
            />
        ) : (
            <span className="text-white font-bold">{initial}</span>
        );

        const avatarWrapper = (
            <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all`}>
                {avatarContent}
            </div>
        );

        if (userId) {
            return (
                <Link to={`/profile/${userId}`} onClick={(e) => e.stopPropagation()}>
                    {avatarWrapper}
                </Link>
            );
        }
        return avatarWrapper;
    };

    // Component ảnh bài chia sẻ - sử dụng PrivacyImage để blur như bài gốc
    const SharedPostImage = ({ src, postOwnerId }) => {
        return (
            <div className="relative aspect-[16/9] bg-gray-100">
                <PrivacyImage 
                    src={src} 
                    alt="" 
                    className="w-full h-full object-cover" 
                    blur={true}
                    forceBlurAll={true}
                    postOwnerId={postOwnerId}
                />
            </div>
        );
    };

    // Nếu là bài chia sẻ - hiển thị khác
    if (item.isShared && item.originalPost) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                {/* Header - Người chia sẻ */}
                <div className="p-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar src={item.user?.avatar || item.authorAvatar} name={item.user?.fullname || item.authorFullname} userId={item.user?._id || item.userId} />
                        <div>
                            <Link to={`/profile/${item.user?._id || item.userId}`} onClick={(e) => e.stopPropagation()} className="hover:underline">
                                <p className="font-semibold text-gray-900">
                                    {item.user?.fullname || item.authorFullname || 'Người dùng'}
                                    <span className="text-gray-500 font-normal text-sm ml-1">đã chia sẻ</span>
                                </p>
                            </Link>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatTimeAgo(item.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lời bình của người chia sẻ */}
                {item.shareComment && (
                    <div className="px-4 pb-3">
                        <p className="text-gray-700">{item.shareComment}</p>
                    </div>
                )}

                {/* Card bài đăng gốc */}
                <div className="px-4 pb-4">
                    <div 
                        onClick={handleViewOriginalPost}
                        className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                    >
                        {/* Header bài gốc */}
                        <div className="p-3 flex items-center gap-3">
                            <Avatar src={item.originalPost.authorAvatar} name={item.originalPost.authorFullname} size="sm" userId={item.originalPost.userId || item.originalPost.user?._id} />
                            <div className="flex-1 min-w-0">
                                <Link to={`/profile/${item.originalPost.userId || item.originalPost.user?._id}`} onClick={(e) => e.stopPropagation()} className="hover:underline">
                                    <p className="font-semibold text-gray-900 text-sm truncate">{item.originalPost.authorFullname || 'Người dùng'}</p>
                                </Link>
                                <p className="text-xs text-gray-500">{new Date(item.originalPost.createdAt).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.originalPost.category === 'lost' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                {item.originalPost.category === 'lost' ? '🔍 Thất lạc' : '✨ Nhặt được'}
                            </span>
                        </div>

                        {/* Nội dung bài gốc */}
                        <div className="px-3 pb-3">
                            <h4 className="font-bold text-blue-600 mb-1 text-sm">{item.originalPost.title}</h4>
                            <p className="text-gray-600 text-sm line-clamp-2">{item.originalPost.description}</p>
                        </div>

                        {/* Ảnh bài gốc - blur như bài gốc */}
                        {item.originalPost.images?.[0] && (
                            <SharedPostImage 
                                src={item.originalPost.images[0]} 
                                postOwnerId={item.originalPost.userId || item.originalPost.user?._id}
                            />
                        )}

                        {/* Tags */}
                        <div className="px-3 py-2 flex gap-2 bg-gray-100">
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded flex items-center gap-1">
                                <Package className="w-3 h-3" /> {item.originalPost.itemType}
                            </span>
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {item.originalPost.location}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-100 flex gap-3">
                    <button
                        onClick={handleToggleFavorite}
                        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
                            isFavorite 
                                ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} />
                    </button>
                    <button
                        onClick={handleViewDetail}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-xl transition-all"
                    >
                        <Eye className="w-4 h-4" />
                        Xem chi tiết
                    </button>
                </div>
            </div>
        );
    }

    // Bài đăng thường
    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
            {/* Header - Avatar, Name, Time, Location */}
            <div className="p-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <Avatar src={item.user?.avatar || item.authorAvatar} name={item.user?.fullname || item.authorFullname} userId={item.user?._id || item.userId} />
                    <div>
                        <Link to={`/profile/${item.user?._id || item.userId}`} onClick={(e) => e.stopPropagation()} className="hover:underline">
                            <p className="font-semibold text-gray-900">{item.user?.fullname || item.authorFullname || 'Người dùng'}</p>
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {formatTimeAgo(item.createdAt)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {item.location}
                            </span>
                        </div>
                    </div>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${item.category === 'lost' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {item.category === 'lost' ? '🔍 Thất lạc' : '✨ Nhặt được'}
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-3">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                {item.description && (
                    <p className="text-gray-600 line-clamp-2 mb-3">{item.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">
                        <Package className="w-3.5 h-3.5" />{item.itemType}
                    </span>
                </div>
            </div>

            {/* Image - forceBlurAll để blur tất cả ở trang danh sách */}
            {item.images && item.images.length > 0 && (
                <div className="relative aspect-[4/3] bg-gray-100">
                    <PrivacyImage 
                        src={item.images[0]} 
                        alt={item.title} 
                        className="w-full h-full object-cover" 
                        blur={true}
                        forceBlurAll={true}
                        postOwnerId={item.user?._id || item.userId}
                        onClick={handleViewDetail}
                    />
                    {item.images.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                            <LayoutGrid className="w-3 h-3" />+{item.images.length - 1}
                        </div>
                    )}
                </div>
            )}

            {/* Footer - Nút yêu thích và xem chi tiết */}
            <div className="px-4 py-3 border-t border-gray-100 flex gap-3">
                <button
                    onClick={handleToggleFavorite}
                    className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
                        isFavorite 
                            ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} />
                </button>
                <button
                    onClick={handleViewDetail}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-xl transition-all"
                >
                    <Eye className="w-4 h-4" />
                    Xem chi tiết
                </button>
            </div>

            {/* Comments Section */}
            {token && user && (
                <div className="px-4 pb-4 border-t border-gray-100">
                    {/* Hiển thị bình luận vừa viết */}
                    {comments.length > 0 && (
                        <div className="pt-3 space-y-3">
                            {comments.map((cmt) => (
                                <div key={cmt._id} className="flex gap-2">
                                    <Avatar src={cmt.user?.avatar} name={cmt.user?.fullname} size="sm" userId={cmt.user?._id} />
                                    <div className="flex-1 bg-gray-100 rounded-2xl px-3 py-2">
                                        <Link to={`/profile/${cmt.user?._id}`} className="hover:underline">
                                            <p className="font-semibold text-sm text-gray-900">{cmt.user?.fullname}</p>
                                        </Link>
                                        <p className="text-sm text-gray-700">{cmt.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Input bình luận */}
                    <form onSubmit={handleSubmitComment} className="flex items-center gap-2 pt-3">
                        <Avatar src={user.avatar} name={user.fullname} size="sm" userId={user._id} />
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="Viết bình luận..."
                                className="w-full px-4 py-2 pr-10 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-200"
                                disabled={submitting}
                            />
                            <button
                                type="submit"
                                disabled={!commentText.trim() || submitting}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-500 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PostCard;
