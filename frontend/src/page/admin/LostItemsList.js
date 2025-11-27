import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Trash2, CheckCircle, XCircle, Clock, Package, MapPin } from 'lucide-react';
import { fetchPosts, deletePost, approvePost, rejectPost } from '../../api/posts.api';
import AdminSection from './components/AdminSection';

export default function LostItemsList() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

    const fetchData = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 20,
                ...(categoryFilter && { category: categoryFilter }),
                ...(statusFilter && { status: statusFilter }),
                ...(searchTerm && { search: searchTerm })
            };
            const result = await fetchPosts(params);
            if (result && result.data) {
                setPosts(result.data);
                if (result.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        page: result.pagination.page || page,
                        total: result.pagination.total || 0,
                        totalPages: result.pagination.totalPages || 0
                    }));
                }
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
        fetchData(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryFilter, statusFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchData(1);
    };

    const handleDeleteClick = (post) => {
        setDeleteConfirm(post);
    };

    const handleDeleteCancel = () => {
        setDeleteConfirm(null);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm) return;
        
        setIsDeleting(true);
        try {
            await deletePost(deleteConfirm._id);
            await fetchData(pagination.page);
            setDeleteConfirm(null);
            alert('Xóa bài đăng thành công!');
        } catch (error) {
            console.error('Lỗi xóa bài đăng:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa bài đăng');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleApprove = async (postId) => {
        try {
            await approvePost(postId);
            await fetchData(pagination.page);
            alert('Duyệt bài đăng thành công!');
        } catch (error) {
            console.error('Lỗi duyệt bài đăng:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi duyệt bài đăng');
        }
    };

    const handleReject = async (postId) => {
        try {
            await rejectPost(postId);
            await fetchData(pagination.page);
            alert('Từ chối bài đăng thành công!');
        } catch (error) {
            console.error('Lỗi từ chối bài đăng:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi từ chối bài đăng');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { text: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-700' },
            approved: { text: 'Đã duyệt', class: 'bg-green-100 text-green-700' },
            rejected: { text: 'Đã từ chối', class: 'bg-red-100 text-red-700' }
        };
        const badge = badges[status] || { text: status, class: 'bg-gray-100 text-gray-700' };
        return (
            <span className={`px-2 py-1 text-xs rounded-full ${badge.class}`}>
                {badge.text}
            </span>
        );
    };

    const getCategoryBadge = (category) => {
        return category === 'lost' ? (
            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Đồ thất lạc</span>
        ) : (
            <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">Đồ nhặt được</span>
        );
    };

    return (
        <AdminSection
            title="Danh sách đồ thất lạc"
            description="Theo dõi và quản lý tất cả các đồ thất lạc đã tiếp nhận."
        >
            <div className="space-y-4">
                {/* Search and Filters */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Tìm theo tiêu đề, mô tả..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                        <div className="min-w-[150px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loại tin</label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Tất cả</option>
                                <option value="lost">Đồ thất lạc</option>
                                <option value="found">Đồ nhặt được</option>
                            </select>
                        </div>
                        <div className="min-w-[150px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Tất cả</option>
                                <option value="pending">Chờ duyệt</option>
                                <option value="approved">Đã duyệt</option>
                                <option value="rejected">Đã từ chối</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Tìm kiếm
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Đang tải...</div>
                    ) : posts.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Không có bài đăng nào</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left p-4 text-sm font-semibold text-gray-700">Tiêu đề</th>
                                            <th className="text-left p-4 text-sm font-semibold text-gray-700">Loại</th>
                                            <th className="text-left p-4 text-sm font-semibold text-gray-700">Đồ vật</th>
                                            <th className="text-left p-4 text-sm font-semibold text-gray-700">Vị trí</th>
                                            <th className="text-left p-4 text-sm font-semibold text-gray-700">Trạng thái</th>
                                            <th className="text-left p-4 text-sm font-semibold text-gray-700">Ngày đăng</th>
                                            <th className="text-right p-4 text-sm font-semibold text-gray-700">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {posts.map((post) => (
                                            <tr key={post._id} className="border-t hover:bg-gray-50 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-medium text-gray-900 max-w-xs truncate" title={post.title}>
                                                        {post.title}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {getCategoryBadge(post.category)}
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Package className="w-4 h-4" />
                                                        {post.itemType || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        {post.location || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {getStatusBadge(post.status)}
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => navigate(`/admin/posts/${post._id}`)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                            title="Xem chi tiết"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        {post.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(post._id)}
                                                                    className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                                    title="Duyệt bài đăng"
                                                                >
                                                                    <CheckCircle className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(post._id)}
                                                                    className="p-2 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                                                                    title="Từ chối bài đăng"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteClick(post)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Xóa bài đăng"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex items-center justify-between p-4 border-t">
                                    <div className="text-sm text-gray-600">
                                        Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} của {pagination.total} bài đăng
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => fetchData(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Trước
                                        </button>
                                        <span className="px-4 py-2 text-sm text-gray-600">
                                            Trang {pagination.page} / {pagination.totalPages}
                                        </span>
                                        <button
                                            onClick={() => fetchData(pagination.page + 1)}
                                            disabled={pagination.page >= pagination.totalPages}
                                            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Sau
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black opacity-40" onClick={handleDeleteCancel}></div>
                    <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Xác nhận xóa bài đăng</h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn xóa bài đăng <strong>{deleteConfirm.title}</strong>?
                            <br />
                            <span className="text-red-600 text-sm mt-2 block">Hành động này không thể hoàn tác!</span>
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleDeleteCancel}
                                disabled={isDeleting}
                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? 'Đang xóa...' : 'Xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminSection>
    );
}

