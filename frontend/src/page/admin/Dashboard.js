import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Package, CheckCircle, Clock, Eye, Edit, Trash2, Check, X } from "lucide-react";
import { fetchPosts, approvePost, rejectPost, deletePost, fetchTopPosters } from "../../api/posts.api";

export default function Dashboard() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        pending: 0,
        completed: 0
    });
    const [topPosters, setTopPosters] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected', 'completed'

    useEffect(() => {
        fetchData();
    }, [statusFilter, search]);

    useEffect(() => {
        fetchTopPostersData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                page: 1,
                limit: 50,
                ...(statusFilter !== 'all' && { status: statusFilter }),
                ...(search && { search })
            };
            const result = await fetchPosts(params);
            if (result && result.data) {
                setPosts(result.data);
                
                // Calculate stats
                const total = result.pagination?.total || 0;
                const approved = result.data.filter(p => p.status === 'approved').length;
                const pending = result.data.filter(p => p.status === 'pending').length;
                const completed = result.data.filter(p => p.status === 'completed').length;
                
                setStats({
                    total,
                    approved,
                    pending,
                    completed
                });
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTopPostersData = async () => {
        try {
            const response = await fetchTopPosters();
            if (response?.data) {
                setTopPosters(response.data);
            } else {
                setTopPosters([]);
            }
        } catch (error) {
            console.error("Error fetching top posters:", error);
            setTopPosters([]);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn duyệt bài đăng này?')) {
            return;
        }
        try {
            await approvePost(id);
            alert('Duyệt bài đăng thành công');
            fetchData();
        } catch (error) {
            alert('Có lỗi xảy ra khi duyệt bài đăng');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn từ chối bài đăng này?')) {
            return;
        }
        try {
            await rejectPost(id);
            alert('Từ chối bài đăng thành công');
            fetchData();
        } catch (error) {
            alert('Có lỗi xảy ra khi từ chối bài đăng');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bài đăng này? Hành động này không thể hoàn tác.')) {
            return;
        }
        try {
            await deletePost(id);
            alert('Xóa bài đăng thành công');
            fetchData();
        } catch (error) {
            alert('Có lỗi xảy ra khi xóa bài đăng');
        }
    };

    return (
        <div className="flex-1 p-6 bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý bài đăng</h1>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bài đăng..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Tất cả</option>
                        <option value="pending">Chờ duyệt</option>
                        <option value="approved">Đã duyệt</option>
                        <option value="rejected">Đã từ chối</option>
                        <option value="completed">Đã hoàn thành</option>
                    </select>
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3">
                    <Package className="text-blue-500" size={30} />
                    <div>
                        <p className="text-gray-500 text-sm">Tổng số bài đăng</p>
                        <p className="text-xl font-bold">{stats.total}</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3">
                    <CheckCircle className="text-green-500" size={30} />
                    <div>
                        <p className="text-gray-500 text-sm">Đã duyệt</p>
                        <p className="text-xl font-bold">{stats.approved}</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3">
                    <Clock className="text-yellow-500" size={30} />
                    <div>
                        <p className="text-gray-500 text-sm">Chờ duyệt</p>
                        <p className="text-xl font-bold">{stats.pending}</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3">
                    <CheckCircle className="text-purple-500" size={30} />
                    <div>
                        <p className="text-gray-500 text-sm">Đã hoàn thành</p>
                        <p className="text-xl font-bold">{stats.completed}</p>
                    </div>
                </div>
            </div>

            {/* Top posters */}
            <div className="bg-white rounded-xl shadow p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Package className="text-purple-500" size={20} />
                        Top người đăng bài
                    </h2>
                    <span className="text-sm text-gray-500">
                        Khen thưởng những thành viên tích cực
                    </span>
                </div>
                {topPosters.length === 0 ? (
                    <div className="text-gray-500 text-sm">Chưa có dữ liệu thống kê.</div>
                ) : (
                    <div className="space-y-3">
                        {topPosters.map((poster, index) => (
                            <div
                                key={poster.userId || index}
                                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            {poster.user?.fullname || 'Ẩn danh'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {poster.user?.email || 'Không có email'} • {poster.user?.phone || 'Không có số điện thoại'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-800 font-semibold">{poster.totalPosts} bài đăng</p>
                                    <p className="text-xs text-gray-500">
                                        Bài gần nhất: {poster.latestPostAt ? new Date(poster.latestPostAt).toLocaleString('vi-VN') : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Posts table */}
            <div className="bg-white rounded-xl shadow p-4">
                <h2 className="text-lg font-semibold mb-3">Danh sách bài đăng</h2>
                {loading ? (
                    <div className="text-center py-8">
                        <div className="text-gray-500">Đang tải...</div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-gray-500">Không có bài đăng nào</div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-t">
                            <thead className="text-gray-600 border-b">
                                <tr>
                                    <th className="py-2">Tiêu đề</th>
                                    <th className="py-2">Người đăng</th>
                                    <th className="py-2">Loại</th>
                                    <th className="py-2">Vị trí</th>
                                    <th className="py-2">Ngày đăng</th>
                                    <th className="py-2">Trạng thái</th>
                                    <th className="py-2 text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map((item) => (
                                    <tr key={item._id} className="border-b last:border-none hover:bg-gray-50">
                                        <td className="py-3">
                                            <div className="font-medium text-gray-800 max-w-xs truncate">
                                                {item.title}
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <span className="text-gray-600">{item.authorFullname || item.user?.fullname || 'Ẩn danh'}</span>
                                        </td>
                                        <td className="py-3">
                                            <span className="text-gray-600">{item.itemType}</span>
                                        </td>
                                        <td className="py-3">
                                            <span className="text-gray-600">{item.location}</span>
                                        </td>
                                        <td className="py-3">
                                            <span className="text-gray-600">
                                                {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    item.status === "approved"
                                                        ? "bg-green-100 text-green-700"
                                                        : item.status === "pending"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : item.status === "rejected"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-blue-100 text-blue-700"
                                                }`}
                                            >
                                                {item.status === "approved" ? "Đã duyệt" :
                                                 item.status === "pending" ? "Chờ duyệt" :
                                                 item.status === "rejected" ? "Đã từ chối" :
                                                 "Đã hoàn thành"}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/posts/${item._id}`)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {item.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(item._id)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                                                            title="Duyệt"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(item._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                            title="Từ chối"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(item._id)}
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
        </div>
    );
}
