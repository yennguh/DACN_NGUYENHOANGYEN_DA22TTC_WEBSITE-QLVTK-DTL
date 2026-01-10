import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Trash2, CheckCircle, Crown, RefreshCw, Package, MapPin, Calendar, User } from 'lucide-react';
import { getImageUrl } from '../../utils/constant';
import { fetchPosts, deletePost, updatePost } from '../../api/posts.api';
import AdminSection from './components/AdminSection';

export default function ReturnedItemsList() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [postTypeFilter, setPostTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch bài có status = completed
            const params = {
                page: 1,
                limit: 200,
                status: 'completed'
            };
            const result = await fetchPosts(params);
            if (result && result.data) {
                setPosts(result.data);
            } else {
                setPosts([]);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (postId) => {
        if (!window.confirm('Xóa bài đăng này?')) return;
        try {
            await deletePost(postId);
            fetchData();
        } catch (error) {
            alert('Có lỗi xảy ra khi xóa');
        }
    };

    // Bỏ tick checkbox -> chuyển về approved
    const handleUncomplete = async (postId) => {
        try {
            await updatePost(postId, { 
                status: 'approved', 
                returnStatus: 'chưa tìm thấy' 
            });
            // Xóa khỏi danh sách ngay lập tức
            setPosts(prev => prev.filter(p => p._id !== postId));
        } catch (error) {
            alert('Có lỗi xảy ra');
        }
    };

    const getAvatarUrl = (item) => {
        const avatar = item.authorAvatar || item.author?.avatar || item.user?.avatar;
        if (!avatar) return null;
        if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
        return getImageUrl(avatar);
    };

    const getDisplayName = (item) => {
        return item.authorFullname || item.author?.fullname || item.user?.fullname || 'Ẩn danh';
    };

    const isAdminPost = (item) => {
        return item.user?.roles?.includes('admin') || item.author?.roles?.includes('admin');
    };

    // Filter posts
    const filteredPosts = posts.filter(item => {
        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            const matchSearch = 
                item.title?.toLowerCase().includes(search) ||
                item.itemType?.toLowerCase().includes(search) ||
                item.location?.toLowerCase().includes(search) ||
                getDisplayName(item).toLowerCase().includes(search);
            if (!matchSearch) return false;
        }
        
        // Post type filter (admin/user)
        if (postTypeFilter !== 'all') {
            const isAdmin = isAdminPost(item);
            if (postTypeFilter === 'admin' && !isAdmin) return false;
            if (postTypeFilter === 'user' && isAdmin) return false;
        }
        
        // Category filter (lost/found)
        if (categoryFilter !== 'all') {
            if (item.category !== categoryFilter) return false;
        }
        
        return true;
    });

    const lostCount = filteredPosts.filter(p => p.category === 'lost').length;
    const foundCount = filteredPosts.filter(p => p.category === 'found').length;

    return (
        <AdminSection title="Hoàn thành" description="Danh sách bài đăng đã hoàn thành (đã tìm được / đã trả lại cho chủ nhân)">
            <div className="space-y-6">
                {/* Info Banner */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-green-800 text-lg">Bài đăng hoàn thành</p>
                            <p className="text-sm text-green-600">
                                Các bài đăng đã được đánh dấu "Đã tìm được" hoặc "Đã trả lại" sẽ tự động hiển thị ở đây.
                            </p>
                        </div>
                        <button 
                            onClick={fetchData}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            title="Làm mới"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 border shadow-sm">
                        <div className="text-3xl font-bold text-green-600">{filteredPosts.length}</div>
                        <div className="text-sm text-gray-500">Tổng hoàn thành</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border shadow-sm">
                        <div className="text-3xl font-bold text-red-500">{lostCount}</div>
                        <div className="text-sm text-gray-500">Đã tìm được (thất lạc)</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border shadow-sm">
                        <div className="text-3xl font-bold text-emerald-500">{foundCount}</div>
                        <div className="text-sm text-gray-500">Đã trả lại (nhặt được)</div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border">
                    <div className="flex-1 relative min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tiêu đề, loại đồ, vị trí..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>
                    
                    {/* Category Filter */}
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setCategoryFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                categoryFilter === 'all' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setCategoryFilter('lost')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                categoryFilter === 'lost' ? 'bg-red-500 text-white shadow' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            🔍 Đã tìm được
                        </button>
                        <button
                            onClick={() => setCategoryFilter('found')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                categoryFilter === 'found' ? 'bg-emerald-500 text-white shadow' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            ✨ Đã trả lại
                        </button>
                    </div>

                    {/* Post Type Filter */}
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setPostTypeFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                postTypeFilter === 'all' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setPostTypeFilter('admin')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                postTypeFilter === 'admin' ? 'bg-indigo-500 text-white shadow' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            👑 Admin
                        </button>
                        <button
                            onClick={() => setPostTypeFilter('user')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                postTypeFilter === 'user' ? 'bg-blue-500 text-white shadow' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            👤 User
                        </button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-12 bg-white rounded-2xl border">
                        <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <div className="text-gray-500">Đang tải danh sách...</div>
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border">
                        <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg font-medium">Chưa có bài đăng nào hoàn thành</p>
                        <p className="text-gray-400 text-sm mt-2">
                            Khi người dùng đánh dấu "Đã tìm được" hoặc "Đã trả lại", bài đăng sẽ hiển thị ở đây
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                        {/* Table Header */}
                        <div className="p-4 border-b bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-6 h-6" />
                                <h2 className="font-bold text-lg">✅ Danh sách hoàn thành</h2>
                                <span className="ml-auto bg-white/20 px-4 py-1 rounded-full text-sm font-medium">
                                    {filteredPosts.length} bài đăng
                                </span>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-center text-xs font-semibold text-gray-500 uppercase py-3 px-4 w-20">
                                            Hoàn thành
                                        </th>
                                        <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">
                                            Bài đăng
                                        </th>
                                        <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">
                                            Người đăng
                                        </th>
                                        <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">
                                            Thông tin
                                        </th>
                                        <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">
                                            Loại
                                        </th>
                                        <th className="text-right text-xs font-semibold text-gray-500 uppercase py-3 px-4">
                                            Hành động
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredPosts.map((item) => {
                                        const avatarUrl = getAvatarUrl(item);
                                        const displayName = getDisplayName(item);
                                        const isAdmin = isAdminPost(item);
                                        const isLost = item.category === 'lost';
                                        
                                        return (
                                            <tr key={item._id} className={`hover:bg-gray-50 transition-colors ${isAdmin ? 'bg-indigo-50/30' : ''}`}>
                                                {/* Checkbox */}
                                                <td className="py-4 px-4 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={true}
                                                        onChange={() => handleUncomplete(item._id)}
                                                        className="w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-500 cursor-pointer"
                                                        title="Bỏ tick để hoàn tác về trạng thái Đã duyệt"
                                                    />
                                                </td>
                                                
                                                {/* Bài đăng */}
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        {item.images?.[0] && (
                                                            <img 
                                                                src={getImageUrl(item.images[0])} 
                                                                alt="" 
                                                                className="w-12 h-12 rounded-lg object-cover border"
                                                            />
                                                        )}
                                                        <div>
                                                            <p className="font-semibold text-gray-800 max-w-[250px] truncate">
                                                                {item.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                
                                                {/* Người đăng */}
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${
                                                            isAdmin ? 'bg-gradient-to-br from-indigo-400 to-purple-500' : 'bg-gradient-to-br from-blue-400 to-cyan-500'
                                                        }`}>
                                                            {avatarUrl ? (
                                                                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-white text-xs font-bold">
                                                                    {displayName.charAt(0).toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-700 text-sm font-medium">{displayName}</span>
                                                            {isAdmin && (
                                                                <div className="flex items-center gap-1 text-xs text-indigo-600">
                                                                    <Crown className="w-3 h-3" /> Admin
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                
                                                {/* Thông tin */}
                                                <td className="py-4 px-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                                            <Package className="w-3.5 h-3.5 text-blue-500" />
                                                            {item.itemType}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                                            <MapPin className="w-3.5 h-3.5 text-green-500" />
                                                            {item.location}
                                                        </div>
                                                    </div>
                                                </td>
                                                
                                                {/* Loại */}
                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                                                        isLost 
                                                            ? 'bg-green-100 text-green-700 border border-green-200' 
                                                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                    }`}>
                                                        {isLost ? '✓ Đã tìm được' : '✓ Đã trả lại'}
                                                    </span>
                                                </td>
                                                
                                                {/* Hành động */}
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button 
                                                            onClick={() => navigate(`/admin/posts/${item._id}`)} 
                                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Xem chi tiết"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(item._id)} 
                                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Xóa bài đăng"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AdminSection>
    );
}
