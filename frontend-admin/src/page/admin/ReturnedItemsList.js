import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Trash2, CheckCircle, RotateCcw, Crown } from 'lucide-react';
import { getImageUrl } from '../../utils/constant';
import { fetchPosts, deletePost, updateReturnStatus } from '../../api/posts.api';
import AdminSection from './components/AdminSection';

export default function ReturnedItemsList() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [postTypeFilter, setPostTypeFilter] = useState('all'); // 'all', 'admin', 'user'

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                page: 1,
                limit: 100,
                returnStatus: 'gửi trả',
                ...(searchTerm && { search: searchTerm })
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    const handleDelete = async (postId) => {
        if (!window.confirm('Xóa bài đăng này?')) return;
        try {
            await deletePost(postId);
            fetchData();
        } catch (error) {
            alert('Có lỗi xảy ra khi xóa');
        }
    };

    const handleUndoReturn = async (postId) => {
        if (!window.confirm('Hoàn tác trạng thái trả đồ?')) return;
        try {
            await updateReturnStatus(postId, 'chưa tìm thấy');
            fetchData();
        } catch (error) {
            alert('Có lỗi xảy ra');
        }
    };

    const getAvatarUrl = (item) => {
        const avatar = item.authorAvatar || item.user?.avatar;
        if (!avatar) return null;
        if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
        return getImageUrl(avatar);
    };

    const getDisplayName = (item) => {
        return item.authorFullname || item.user?.fullname || 'Ẩn danh';
    };

    const isAdminPost = (item) => {
        return item.user?.roles?.includes('admin');
    };

    const filteredPosts = posts.filter(item => {
        if (postTypeFilter === 'all') return true;
        const isAdmin = isAdminPost(item);
        if (postTypeFilter === 'admin') return isAdmin;
        if (postTypeFilter === 'user') return !isAdmin;
        return true;
    });

    return (
        <AdminSection title="Đã trả đồ" description="Danh sách bài đăng đã được trả lại cho chủ nhân">
            <div className="space-y-6">
                {/* Info */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                        <p className="font-medium text-green-800">Đồ vật đã được trả</p>
                        <p className="text-sm text-green-600">Các bài đăng này đã hoàn thành việc trả đồ cho chủ nhân.</p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 relative min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>
                    {/* Filter theo loại người đăng */}
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
                    <div className="text-sm text-gray-600">
                        Tổng: <span className="font-bold text-green-600">{filteredPosts.length}</span> bài đăng
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <div className="text-gray-500">Đang tải...</div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b bg-gradient-to-r from-green-500 to-emerald-500 text-white flex items-center gap-3">
                            <CheckCircle className="w-5 h-5" />
                            <h2 className="font-bold text-lg">✅ Đã trả đồ</h2>
                            <span className="ml-auto bg-white/20 px-3 py-1 rounded-full text-sm font-medium">{filteredPosts.length} bài</span>
                        </div>
                        {filteredPosts.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">Chưa có bài đăng nào được trả đồ</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/80">
                                        <tr>
                                            <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Tiêu đề</th>
                                            <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Người đăng</th>
                                            <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Loại đồ</th>
                                            <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Vị trí</th>
                                            <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Ngày đăng</th>
                                            <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Loại</th>
                                            <th className="text-right text-xs font-semibold text-gray-500 uppercase py-3 px-4">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredPosts.map((item) => {
                                            const avatarUrl = getAvatarUrl(item);
                                            const displayName = getDisplayName(item);
                                            const isAdmin = isAdminPost(item);
                                            return (
                                                <tr key={item._id} className={`hover:bg-gray-50/50 transition-colors ${isAdmin ? 'bg-indigo-50/30' : ''}`}>
                                                    <td className="py-3 px-4">
                                                        <p className="font-medium text-gray-800 max-w-[200px] truncate">{item.title}</p>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${isAdmin ? 'bg-gradient-to-br from-indigo-400 to-purple-500' : 'bg-gradient-to-br from-green-400 to-emerald-500'}`}>
                                                                {avatarUrl ? (
                                                                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                                                                ) : null}
                                                                <span className={`text-white text-xs font-bold ${avatarUrl ? 'hidden' : ''}`}>{displayName.charAt(0).toUpperCase()}</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-gray-700 text-sm">{displayName}</span>
                                                                {isAdmin && (
                                                                    <span className="inline-flex items-center gap-1 text-xs text-indigo-600 font-medium">
                                                                        <Crown className="w-3 h-3" /> Admin
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-600 text-sm">{item.itemType}</td>
                                                    <td className="py-3 px-4 text-gray-600 text-sm">{item.location}</td>
                                                    <td className="py-3 px-4 text-gray-500 text-sm">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                                                    <td className="py-3 px-4">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.category === 'found' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {item.category === 'found' ? 'Nhặt được' : 'Thất lạc'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button onClick={() => navigate(`/admin/posts/${item._id}`)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Xem">
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleUndoReturn(item._id)} className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg" title="Hoàn tác">
                                                                <RotateCcw className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDelete(item._id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Xóa">
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
                        )}
                    </div>
                )}
            </div>
        </AdminSection>
    );
}
