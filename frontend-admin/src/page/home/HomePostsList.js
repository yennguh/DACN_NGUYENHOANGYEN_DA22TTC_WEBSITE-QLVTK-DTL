import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, Clock, Eye, MapPin, LayoutGrid, Package, X, SlidersHorizontal } from "lucide-react";
import { fetchPosts } from "../../api/posts.api";
import { AuthContext } from "../../core/AuthContext";
import { jwtDecode } from "jwt-decode";
import { getImageUrl } from '../../utils/constant';
import { PostListSkeleton } from '../../core/LoadingSpinner';
import PrivacyImage from '../../components/PrivacyImage';

const HomePostsList = () => {
    const navigate = useNavigate();
    const { token, user: authUser } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [itemTypeFilter, setItemTypeFilter] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [showMyPosts, setShowMyPosts] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            let userId = null;
            if (token && showMyPosts) {
                try {
                    const decoded = jwtDecode(token);
                    userId = decoded._id;
                } catch (err) {}
            }

            const params = {
                page: 1,
                limit: 20,
                ...(userId && showMyPosts && { userId }),
                ...(categoryFilter && { category: categoryFilter }),
                ...(itemTypeFilter && { itemType: itemTypeFilter }),
                ...(locationFilter && { location: locationFilter }),
                ...(searchTerm && { search: searchTerm })
            };
            const result = await fetchPosts(params);
            if (result && result.data) {
                setPosts(result.data);
            } else if (result && Array.isArray(result)) {
                setPosts(result);
            } else {
                setPosts([]);
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [categoryFilter, itemTypeFilter, locationFilter, searchTerm, showMyPosts]);

    useEffect(() => {
        if (!authUser) return;
        setPosts((prev) => prev.map(p => {
            if (p.user && authUser && p.user._id === authUser._id) {
                return { ...p, user: { ...p.user, avatar: authUser.avatar, fullname: authUser.fullname } };
            }
            return p;
        }));
    }, [authUser]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchData();
    };

    const clearFilters = () => {
        setCategoryFilter("");
        setItemTypeFilter("");
        setLocationFilter("");
        setSearchTerm("");
    };

    const hasActiveFilters = categoryFilter || itemTypeFilter || locationFilter || searchTerm;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Đồ thất lạc</h1>
                            <p className="text-gray-500 text-sm mt-1">Tìm kiếm và đăng tin đồ thất lạc</p>
                        </div>
                        
                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium text-sm transition-all ${
                                showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Bộ lọc
                        </button>

                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setCategoryFilter("")}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${!categoryFilter ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                Tất cả
                            </button>
                            <button
                                onClick={() => setCategoryFilter("found")}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${categoryFilter === 'found' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                ✨ Nhặt được
                            </button>
                            <button
                                onClick={() => setCategoryFilter("lost")}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${categoryFilter === 'lost' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                🔍 Thất lạc
                            </button>
                        </div>

                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                <X className="w-4 h-4" />
                                Xóa lọc
                            </button>
                        )}
                    </div>

                    {token && (
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={showMyPosts} onChange={(e) => setShowMyPosts(e.target.checked)} className="w-4 h-4 accent-blue-600 rounded" />
                            <span className="text-sm text-gray-700">Bài của tôi</span>
                        </label>
                    )}
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Loại tin</label>
                                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none">
                                    <option value="">Tất cả</option>
                                    <option value="lost">Đồ thất lạc</option>
                                    <option value="found">Đồ nhặt được</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Loại đồ vật</label>
                                <input type="text" value={itemTypeFilter} onChange={(e) => setItemTypeFilter(e.target.value)} placeholder="VD: Điện thoại, Ví..." className="w-full p-2.5 border border-gray-300 rounded-lg outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Vị trí</label>
                                <input type="text" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} placeholder="VD: Thư viện, Căn tin..." className="w-full p-2.5 border border-gray-300 rounded-lg outline-none" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading */}
                {loading && <PostListSkeleton count={6} />}

                {/* Empty State */}
                {!loading && posts.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Không tìm thấy bài đăng</h3>
                        <p className="text-gray-500 text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    </div>
                )}

                {/* Posts List */}
                {!loading && posts.length > 0 && (
                    <div className="max-w-4xl mx-auto space-y-6">
                        {posts.map((item) => (
                            <div
                                key={item._id}
                                onClick={() => navigate(token ? `/baidang/${item._id}` : '/login')}
                                className="bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer group hover:shadow-lg hover:border-gray-300 transition-all duration-300"
                            >
                                {/* User Header */}
                                <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                                    <Link to={`/profile/${item.user?._id || item.userId}`} onClick={(e) => e.stopPropagation()} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-blue-300 transition-all">
                                        {(item.user?.avatar || item.authorAvatar) ? (
                                            <img src={getImageUrl(item.user?.avatar || item.authorAvatar)} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                                        ) : (
                                            <span className="text-white text-sm font-bold">{item.user?.fullname?.substring(0, 1).toUpperCase() || 'U'}</span>
                                        )}
                                    </Link>
                                    <div className="flex-1">
                                        <Link to={`/profile/${item.user?._id || item.userId}`} onClick={(e) => e.stopPropagation()} className="hover:underline">
                                            <p className="font-medium text-gray-900">{item.user?.fullname || 'Người dùng'}</p>
                                        </Link>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(item.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${item.category === 'lost' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        {item.category === 'lost' ? '🔍 Thất lạc' : '✨ Nhặt được'}
                                    </div>
                                </div>

                                {/* Title & Description */}
                                <div className="px-4 py-3">
                                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                                    {item.description && <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>}
                                </div>

                                {/* Image - Làm mờ tất cả ảnh ở trang danh sách */}
                                <div className="relative bg-gray-100">
                                    {item.images && item.images.length > 0 ? (
                                        <PrivacyImage 
                                            src={item.images[0]} 
                                            alt={item.title} 
                                            className="w-full max-h-[400px] object-cover" 
                                            blur={true}
                                            postOwnerId={item.user?._id || item.userId}
                                        />
                                    ) : (
                                        <div className="w-full h-48 flex items-center justify-center"><Package className="w-16 h-16 text-gray-300" /></div>
                                    )}
                                    {item.images && item.images.length > 1 && (
                                        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 z-10">
                                            <LayoutGrid className="w-4 h-4" />{item.images.length} ảnh
                                        </div>
                                    )}
                                </div>

                                {/* Meta & Actions */}
                                <div className="p-4">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full"><Package className="w-4 h-4" />{item.itemType}</span>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-full"><MapPin className="w-4 h-4" />{item.location}</span>
                                    </div>
                                    <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors">
                                        <Eye className="w-5 h-5" />Xem chi tiết
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePostsList;
