import React, { useState, useEffect } from 'react';
import AdminSection from './components/AdminSection';
import { fetchPosts, markItemFound, markItemNotFound, deletePost } from '../../api/posts.api';
import { Search, Eye, Check, X, Trash2 } from 'lucide-react';

export default function FoundItemsList() {
    const [search, setSearch] = useState("");
    const [foundItems, setFoundItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [foundCount, setFoundCount] = useState(0);
    const [returnType, setReturnType] = useState('all'); // 'all', 'found', 'not_found'

    useEffect(() => {
        fetchData();
    }, [search, returnType]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                page: 1,
                limit: 50,
                status: 'completed',
                ...(search && { search })
            };
            const result = await fetchPosts(params);
            if (result && result.data) {
                setFoundItems(result.data);
                setFoundCount(result.pagination?.total || result.data.length);
            }
        } catch (error) {
            console.error("Error fetching found items:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkFound = async (id, item) => {
        if (!window.confirm(`Xác nhận "${item.title}" đã được tìm thấy và trả lại?`)) {
            return;
        }
        try {
            await markItemFound(id);
            alert('Xác nhận tìm thấy thành công');
            fetchData();
        } catch (error) {
            alert('Có lỗi xảy ra');
        }
    };

    const handleMarkNotFound = async (id, item) => {
        if (!window.confirm(`Xác nhận "${item.title}" chưa được tìm thấy?`)) {
            return;
        }
        try {
            await markItemNotFound(id);
            alert('Xác nhận chưa tìm thấy thành công');
            fetchData();
        } catch (error) {
            alert('Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id, item) => {
        if (!window.confirm(`Xóa "${item.title}"?`)) {
            return;
        }
        try {
            await deletePost(id);
            alert('Xóa thành công');
            fetchData();
        } catch (error) {
            alert('Có lỗi xảy ra khi xóa');
        }
    };

    return (
        <AdminSection
            title="Danh sách đã trả"
            description="Theo dõi các vật dụng đã xác nhận trả lại cho chủ sở hữu."
        >
            <div className="rounded-lg bg-white p-6 shadow">
                {/* Search and Stats */}
                <div className="mb-6 flex gap-4 items-center">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm đồ vật..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="text-sm font-semibold text-gray-700">
                        Tổng: {foundCount}
                    </div>
                </div>

                {/* Items Table */}
                {loading ? (
                    <div className="text-center py-8">
                        <div className="text-gray-500">Đang tải...</div>
                    </div>
                ) : foundItems.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-gray-500">Không có bài đăng nào đã trả</div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-t">
                            <thead className="text-gray-600 border-b bg-gray-50">
                                <tr>
                                    <th className="py-3 px-4">Tiêu đề</th>
                                    <th className="py-3 px-4">Người đăng</th>
                                    <th className="py-3 px-4">Loại</th>
                                    <th className="py-3 px-4">Vị trí</th>
                                    <th className="py-3 px-4">Ngày đăng</th>
                                    <th className="py-3 px-4 text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {foundItems.map((item) => (
                                    <tr key={item._id} className="border-b last:border-none hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-gray-800 max-w-xs truncate">
                                                {item.title}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-gray-600">{item.authorFullname || item.user?.fullname || 'Ẩn danh'}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-gray-600">{item.itemType}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-gray-600">{item.location}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-gray-600">
                                                {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleMarkFound(item._id, item)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded"
                                                    title="Xác nhận tìm thấy"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleMarkNotFound(item._id, item)}
                                                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                                                    title="Chưa tìm thấy"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item._id, item)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                    title="Xóa"
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
                )}
            </div>
        </AdminSection>
    );
}

