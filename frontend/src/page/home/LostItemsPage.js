import { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Package, X, SlidersHorizontal, Plus } from "lucide-react";
import { fetchPosts } from "../../api/posts.api";
import { AuthContext } from "../../core/AuthContext";
import { jwtDecode } from "jwt-decode";
import { PostListSkeleton } from '../../core/LoadingSpinner';
import PostCard from '../../components/PostCard';

const LostItemsPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const userIdFromUrl = searchParams.get('userId');
    const { token, user: authUser } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [itemTypeFilter, setItemTypeFilter] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [showMyPosts, setShowMyPosts] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [viewingUserName, setViewingUserName] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            let userId = userIdFromUrl || null;
            if (!userId && token && showMyPosts) {
                try {
                    const decoded = jwtDecode(token);
                    userId = decoded._id;
                } catch (err) {}
            }

            const params = {
                page: 1,
                limit: 20,
                status: 'approved',
                ...(userId && { userId }),
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryFilter, itemTypeFilter, locationFilter, searchTerm, showMyPosts, userIdFromUrl]);

    // Lấy tên user khi xem bài đăng của người khác
    useEffect(() => {
        if (userIdFromUrl && posts.length > 0) {
            const firstPost = posts[0];
            if (firstPost.user?.fullname) {
                setViewingUserName(firstPost.user.fullname);
            } else if (firstPost.authorFullname) {
                setViewingUserName(firstPost.authorFullname);
            }
        } else {
            setViewingUserName("");
        }
    }, [userIdFromUrl, posts]);

    const clearUserFilter = () => {
        setSearchParams({});
    };

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
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                                {userIdFromUrl ? `📝 Bài đăng của ${viewingUserName || 'người dùng'}` : '🔍 Đồ thất lạc'}
                            </h1>
                            <p className="text-blue-100 text-lg">
                                {userIdFromUrl ? 'Xem tất cả bài đăng của thành viên này' : 'Tìm kiếm và đăng tin đồ thất lạc tại ĐH Trà Vinh'}
                            </p>
                            {userIdFromUrl && (
                                <button 
                                    onClick={clearUserFilter}
                                    className="mt-2 inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/30 transition-all"
                                >
                                    <X className="w-4 h-4" /> Xem tất cả bài đăng
                                </button>
                            )}
                        </div>
                        
                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex-1 max-w-lg">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm đồ vật..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none"
                                />
                            </div>
                        </form>

                        <button
                            onClick={() => navigate('/baidang/create')}
                            className="flex items-center gap-2 bg-yellow-400 text-gray-900 px-6 py-4 rounded-2xl font-bold hover:bg-yellow-300 transition-all shadow-lg"
                        >
                            <Plus className="w-5 h-5" />
                            Đăng tin mới
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-3xl mx-auto px-6 py-8">
                {/* Filter Bar */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                                    showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Bộ lọc
                            </button>

                            <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-xl">
                                <button
                                    onClick={() => setCategoryFilter("")}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${!categoryFilter ? 'bg-white text-gray-900 shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Tất cả
                                </button>
                                <button
                                    onClick={() => setCategoryFilter("found")}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${categoryFilter === 'found' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    ✨ Nhặt được
                                </button>
                                <button
                                    onClick={() => setCategoryFilter("lost")}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${categoryFilter === 'lost' ? 'bg-red-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    🔍 Thất lạc
                                </button>
                            </div>

                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                    <X className="w-4 h-4" />
                                    Xóa lọc
                                </button>
                            )}
                        </div>

                        {token && (
                            <label className="flex items-center gap-2 cursor-pointer bg-blue-50 px-4 py-2 rounded-xl">
                                <input type="checkbox" checked={showMyPosts} onChange={(e) => setShowMyPosts(e.target.checked)} className="w-5 h-5 accent-blue-600 rounded" />
                                <span className="text-sm font-semibold text-blue-700">Bài của tôi</span>
                            </label>
                        )}
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Loại tin</label>
                                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500">
                                        <option value="">Tất cả</option>
                                        <option value="lost">Đồ thất lạc</option>
                                        <option value="found">Đồ nhặt được</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Loại đồ vật</label>
                                    <input type="text" value={itemTypeFilter} onChange={(e) => setItemTypeFilter(e.target.value)} placeholder="VD: Điện thoại, Ví..." className="w-full p-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Vị trí</label>
                                    <input type="text" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} placeholder="VD: Thư viện, Căn tin..." className="w-full p-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Loading */}
                {loading && <PostListSkeleton count={6} />}

                {/* Empty State */}
                {!loading && posts.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-12 h-12 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">Không tìm thấy bài đăng</h3>
                        <p className="text-gray-500 mb-6">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                        <button onClick={() => navigate('/baidang/create')} className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all">
                            <Plus className="w-5 h-5" />
                            Đăng tin mới
                        </button>
                    </div>
                )}

                {/* Posts List */}
                {!loading && posts.length > 0 && (
                    <div className="space-y-6">
                        {posts.map((item) => (
                            <PostCard key={item._id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LostItemsPage;
