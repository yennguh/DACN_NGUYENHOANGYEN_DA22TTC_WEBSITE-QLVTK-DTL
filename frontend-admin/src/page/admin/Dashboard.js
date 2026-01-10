import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Search, Package, CheckCircle, Clock, Eye, Trash2, Check, X, Edit,
    TrendingUp, MapPin, Tag, Users, AlertCircle, BarChart3, PieChart, Flag, Share2
} from "lucide-react";
import { fetchPosts, approvePost, rejectPost, deletePost, fetchTopPosters } from "../../api/posts.api";
import { countPendingReports } from "../../api/reports.api";
import { getImageUrl } from "../../utils/constant";

export default function Dashboard() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        pending: 0,
        completed: 0,
        rejected: 0,
        lost: 0,
        found: 0,
        shared: 0,
        pendingReports: 0
    });
    const [topPosters, setTopPosters] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [locationStats, setLocationStats] = useState([]);
    const [itemTypeStats, setItemTypeStats] = useState([]);
    const [postTypeFilter, setPostTypeFilter] = useState('all'); // 'all', 'admin', 'user'

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, search]);

    useEffect(() => {
        fetchTopPostersData();
        fetchReportsCount();
    }, []);

    const fetchReportsCount = async () => {
        try {
            const result = await countPendingReports();
            if (result) {
                setStats(prev => ({ ...prev, pendingReports: result.count || 0 }));
            }
        } catch (error) {
            console.error("Error fetching reports count:", error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch tất cả bài để thống kê chính xác
            const allResult = await fetchPosts({ page: 1, limit: 1000 });
            
            // Fetch bài theo filter để hiển thị
            const params = {
                page: 1,
                limit: 100,
                ...(statusFilter !== 'all' && { status: statusFilter }),
                ...(search && { search })
            };
            const result = await fetchPosts(params);
            
            if (result && result.data) {
                setPosts(result.data);
            }
            
            // Calculate stats từ tất cả bài
            if (allResult && allResult.data) {
                const allPosts = allResult.data;
                const total = allResult.pagination?.total || allPosts.length;
                const approved = allPosts.filter(p => p.status === 'approved').length;
                const pending = allPosts.filter(p => p.status === 'pending').length;
                const completed = allPosts.filter(p => p.status === 'completed').length;
                const rejected = allPosts.filter(p => p.status === 'rejected').length;
                const lost = allPosts.filter(p => p.category === 'lost').length;
                const found = allPosts.filter(p => p.category === 'found').length;
                const shared = allPosts.filter(p => p.isShared).length;
                
                setStats(prev => ({ ...prev, total, approved, pending, completed, rejected, lost, found, shared }));

                // Location stats
                const locMap = {};
                allPosts.forEach(p => {
                    if (p.location) {
                        locMap[p.location] = (locMap[p.location] || 0) + 1;
                    }
                });
                const locArr = Object.entries(locMap)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);
                setLocationStats(locArr);

                // Item type stats
                const typeMap = {};
                allPosts.forEach(p => {
                    if (p.itemType) {
                        typeMap[p.itemType] = (typeMap[p.itemType] || 0) + 1;
                    }
                });
                const typeArr = Object.entries(typeMap)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);
                setItemTypeStats(typeArr);
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
                setTopPosters(response.data.slice(0, 5));
            }
        } catch (error) {
            console.error("Error fetching top posters:", error);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Duyệt bài đăng này?')) return;
        try {
            await approvePost(id);
            fetchData();
        } catch (error) {
            alert('Có lỗi xảy ra');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Từ chối bài đăng này?')) return;
        try {
            await rejectPost(id);
            fetchData();
        } catch (error) {
            alert('Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xóa bài đăng này?')) return;
        try {
            await deletePost(id);
            fetchData();
        } catch (error) {
            alert('Có lỗi xảy ra');
        }
    };

    const maxLocationCount = Math.max(...locationStats.map(l => l.count), 1);
    const maxTypeCount = Math.max(...itemTypeStats.map(t => t.count), 1);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 Dashboard</h1>
                <p className="text-gray-500">Tổng quan hệ thống quản lý đồ thất lạc</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-4 mb-8">
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                            <p className="text-xs text-gray-500">Tổng bài đăng</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                            <p className="text-xs text-gray-500">Đã duyệt</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            <p className="text-xs text-gray-500">Chờ duyệt</p>
                        </div>
                    </div>
                </div>

                <div 
                    onClick={() => navigate('/admin/returned-items')}
                    className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer hover:border-purple-300"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
                            <p className="text-xs text-gray-500">Hoàn thành</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                            <p className="text-xs text-gray-500">Từ chối</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <Search className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-orange-600">{stats.lost}</p>
                            <p className="text-xs text-gray-500">Thất lạc</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-emerald-600">{stats.found}</p>
                            <p className="text-xs text-gray-500">Nhặt được</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                            <Share2 className="w-6 h-6 text-pink-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-pink-600">{stats.shared}</p>
                            <p className="text-xs text-gray-500">Được chia sẻ</p>
                        </div>
                    </div>
                </div>

                <div 
                    onClick={() => navigate('/admin/reports')}
                    className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer hover:border-rose-300"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                            <Flag className="w-6 h-6 text-rose-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-rose-600">{stats.pendingReports}</p>
                            <p className="text-xs text-gray-500">Tố cáo chờ xử lý</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Location Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-gray-800">Top vị trí</h3>
                    </div>
                    {locationStats.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">Chưa có dữ liệu</p>
                    ) : (
                        <div className="space-y-4">
                            {locationStats.map((loc, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700 truncate">{loc.name}</span>
                                        <span className="font-semibold text-blue-600">{loc.count}</span>
                                    </div>
                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                                            style={{ width: `${(loc.count / maxLocationCount) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Item Type Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                        <Tag className="w-5 h-5 text-purple-600" />
                        <h3 className="font-bold text-gray-800">Loại đồ vật</h3>
                    </div>
                    {itemTypeStats.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">Chưa có dữ liệu</p>
                    ) : (
                        <div className="space-y-4">
                            {itemTypeStats.map((type, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700 truncate">{type.name}</span>
                                        <span className="font-semibold text-purple-600">{type.count}</span>
                                    </div>
                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-500"
                                            style={{ width: `${(type.count / maxTypeCount) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Category Pie Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                        <PieChart className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-bold text-gray-800">Phân loại bài đăng</h3>
                    </div>
                    <div className="flex items-center justify-center">
                        <div className="relative w-40 h-40">
                            {/* Simple Donut Chart */}
                            <svg viewBox="0 0 36 36" className="w-full h-full">
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3"></circle>
                                <circle 
                                    cx="18" cy="18" r="15.9" fill="none" 
                                    stroke="#f97316" strokeWidth="3"
                                    strokeDasharray={`${(stats.lost / (stats.total || 1)) * 100} 100`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 18 18)"
                                ></circle>
                                <circle 
                                    cx="18" cy="18" r="15.9" fill="none" 
                                    stroke="#10b981" strokeWidth="3"
                                    strokeDasharray={`${(stats.found / (stats.total || 1)) * 100} 100`}
                                    strokeDashoffset={`-${(stats.lost / (stats.total || 1)) * 100}`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 18 18)"
                                ></circle>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-gray-800">{stats.total}</span>
                                <span className="text-xs text-gray-500">Tổng</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">Thất lạc ({stats.lost})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">Nhặt được ({stats.found})</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Posters */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
                <div className="flex items-center gap-2 mb-6">
                    <Users className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-bold text-gray-800">Top người đăng bài</h3>
                </div>
                {topPosters.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">Chưa có dữ liệu</p>
                ) : (
                    <div className="grid md:grid-cols-5 gap-4">
                        {topPosters.map((poster, index) => (
                            <div key={poster.userId || index} className={`
                                relative p-4 rounded-xl border-2 text-center
                                ${index === 0 ? 'bg-yellow-50 border-yellow-300' : 
                                  index === 1 ? 'bg-slate-50 border-slate-300' :
                                  index === 2 ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'}
                            `}>
                                <div className={`
                                    absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full 
                                    flex items-center justify-center text-white text-xs font-bold
                                    ${index === 0 ? 'bg-yellow-500' : 
                                      index === 1 ? 'bg-slate-400' :
                                      index === 2 ? 'bg-amber-600' : 'bg-blue-500'}
                                `}>
                                    {index + 1}
                                </div>
                                <div className={`
                                    w-14 h-14 mx-auto rounded-full flex items-center justify-center text-xl font-bold text-white mb-2 overflow-hidden
                                    ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                                      index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' :
                                      index === 2 ? 'bg-gradient-to-br from-amber-500 to-amber-700' : 'bg-gradient-to-br from-blue-400 to-blue-600'}
                                `}>
                                    {poster.user?.avatar ? (
                                        <img 
                                            src={getImageUrl(poster.user.avatar)} 
                                            alt="" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ) : null}
                                    <span className={poster.user?.avatar ? 'hidden' : ''}>
                                        {poster.user?.fullname?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <p className="font-semibold text-gray-800 truncate">{poster.user?.fullname || 'Ẩn danh'}</p>
                                <p className="text-2xl font-bold text-blue-600">{poster.totalPosts}</p>
                                <p className="text-xs text-gray-500">bài đăng</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Posts Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            <h3 className="font-bold text-gray-800">Danh sách bài đăng</h3>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
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
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="pending">Chờ duyệt</option>
                                <option value="approved">Đã duyệt</option>
                                <option value="rejected">Từ chối</option>
                                <option value="completed">Hoàn thành</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-gray-500">Đang tải...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Không có bài đăng nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold">Tiêu đề</th>
                                    <th className="px-6 py-4 text-left font-semibold">Người đăng</th>
                                    <th className="px-6 py-4 text-left font-semibold">Loại</th>
                                    <th className="px-6 py-4 text-left font-semibold">Vị trí</th>
                                    <th className="px-6 py-4 text-left font-semibold">Phân loại</th>
                                    <th className="px-6 py-4 text-left font-semibold">Trạng thái</th>
                                    <th className="px-6 py-4 text-right font-semibold">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {posts
                                    .filter(item => {
                                        if (postTypeFilter === 'all') return true;
                                        const isAdminPost = item.user?.roles?.includes('admin');
                                        if (postTypeFilter === 'admin') return isAdminPost;
                                        if (postTypeFilter === 'user') return !isAdminPost;
                                        return true;
                                    })
                                    .slice(0, 20)
                                    .map((item) => {
                                        const isAdminPost = item.user?.roles?.includes('admin');
                                        return (
                                            <tr key={item._id} className={`hover:bg-blue-50/50 transition-colors ${isAdminPost ? 'bg-indigo-50/30' : ''}`}>
                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-gray-800 max-w-xs truncate">{item.title}</p>
                                                    <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                            {(item.authorAvatar || item.user?.avatar) ? (
                                                                <img 
                                                                    src={getImageUrl(item.authorAvatar || item.user?.avatar)} 
                                                                    alt="" 
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                                />
                                                            ) : null}
                                                            <span className={(item.authorAvatar || item.user?.avatar) ? 'hidden' : 'text-white text-xs font-bold'}>
                                                                {(item.authorFullname || item.user?.fullname || 'U').charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <span className="text-gray-600">{item.authorFullname || item.user?.fullname || 'Ẩn danh'}</span>
                                                        {isAdminPost && (
                                                            <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">👑 Admin</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">{item.itemType}</span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{item.location}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                                        item.category === 'lost' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                        {item.category === 'lost' ? '🔍 Thất lạc' : '✨ Nhặt được'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        item.status === "approved" ? "bg-green-100 text-green-700" :
                                                        item.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                                        item.status === "rejected" ? "bg-red-100 text-red-700" :
                                                        "bg-purple-100 text-purple-700"
                                                    }`}>
                                                        {item.status === "approved" ? "Đã duyệt" :
                                                         item.status === "pending" ? "Chờ duyệt" :
                                                         item.status === "rejected" ? "Từ chối" : "Hoàn thành"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button onClick={() => navigate(`/admin/posts/${item._id}`)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg" title="Xem">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => navigate(`/admin/posts/${item._id}/edit`)} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg" title="Chỉnh sửa">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        {item.status === 'pending' && (
                                                            <>
                                                                <button onClick={() => handleApprove(item._id)} className="p-2 text-green-600 hover:bg-green-100 rounded-lg" title="Duyệt">
                                                                    <Check className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => handleReject(item._id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg" title="Từ chối">
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                        <button onClick={() => handleDelete(item._id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg" title="Xóa">
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
        </div>
    );
}
