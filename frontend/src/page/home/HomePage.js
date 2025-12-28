import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Package, SlidersHorizontal, X } from 'lucide-react';
import TopPosters from './TopPosters';
import { fetchPosts, fetchTopPosters } from '../../api/posts.api';
import { PostListSkeleton } from '../../core/LoadingSpinner';
import PostCard from '../../components/PostCard';
import { AuthContext } from '../../core/AuthContext';

const HomePage = () => {
    const { token, user: authUser } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [itemTypeFilter, setItemTypeFilter] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [topPosterIds, setTopPosterIds] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            setError(null);
            const params = {
                page: 1,
                limit: 10,
                status: 'approved',
                ...(categoryFilter && { category: categoryFilter }),
                ...(itemTypeFilter && { itemType: itemTypeFilter }),
                ...(locationFilter && { location: locationFilter })
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
            setError('Không thể tải bài đăng. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        loadTopPosters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryFilter, itemTypeFilter, locationFilter]);

    const loadTopPosters = async () => {
        try {
            const result = await fetchTopPosters();
            // API trả về { data: [...] } hoặc array trực tiếp
            const topPosters = result?.data || result;
            if (topPosters && Array.isArray(topPosters)) {
                // Lấy userId của top poster đầu tiên (người đăng nhiều nhất)
                // Backend trả về { userId: "...", totalPosts: ..., user: {...} }
                const topIds = topPosters.slice(0, 1).map(p => p.userId);
                console.log('Top poster IDs:', topIds);
                setTopPosterIds(topIds);
            }
        } catch (error) {
            console.error('Error loading top posters:', error);
        }
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

    const clearFilters = () => {
        setCategoryFilter("");
        setItemTypeFilter("");
        setLocationFilter("");
    };

    const hasActiveFilters = categoryFilter || itemTypeFilter || locationFilter;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Banner */}
            <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                            Hệ thống tìm kiếm <br/>
                            <span className="text-yellow-300">đồ thất lạc</span>
                        </h1>
                        <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                            Dành cho sinh viên và cán bộ trong trường Đại học Trà Vinh. 
                            Đăng tin, tìm kiếm và kết nối để tìm lại đồ vật bị mất.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link to="/do-that-lac" className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg">
                                <Search className="w-5 h-5" />
                                Tìm đồ thất lạc
                            </Link>
                            <Link to="/baidang/create" className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-yellow-300 transition-all">
                                <Package className="w-5 h-5" />
                                Đăng tin
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bài đăng Section */}
            <section className="py-12 bg-gray-50">
                <div className="max-w-3xl mx-auto px-6">
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

                    {/* Bài đăng mới nhất */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">📋 Bài đăng mới nhất</h2>
                        <Link to="/do-that-lac" className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
                            Xem tất cả <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Loading */}
                    {loading && <PostListSkeleton count={6} />}

                    {/* Error */}
                    {!loading && error && (
                        <div className="text-center py-12 bg-red-50 rounded-xl">
                            <p className="text-red-500 mb-4">{error}</p>
                            <button 
                                onClick={() => fetchData()} 
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                Thử lại
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && posts.length === 0 && (
                        <div className="text-center py-20">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Package className="w-12 h-12 text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">Chưa có bài đăng nào</h3>
                            <p className="text-gray-500 mb-6">Hãy là người đầu tiên đăng tin!</p>
                            <Link to="/baidang/create" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all">
                                Đăng tin mới
                            </Link>
                        </div>
                    )}

                    {/* Posts List */}
                    {!loading && !error && posts.length > 0 && (
                        <div className="space-y-6">
                    {posts.map((item) => {
                                const itemUserId = String(item.userId || item.user?._id || '');
                                return (
                                    <PostCard 
                                        key={item._id} 
                                        item={item} 
                                        isTopPoster={topPosterIds.includes(itemUserId)}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Top Posters */}
            <TopPosters compact={true} />

            {/* CTA */}
            <section className="py-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-2xl lg:text-3xl font-bold mb-4">Bạn đã mất đồ vật?</h2>
                    <p className="text-blue-100 mb-8">Đăng tin ngay để cộng đồng TVU giúp bạn tìm lại</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/baidang/create" className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg">
                            Đăng tin ngay <ArrowRight className="w-5 h-5" />
                        </Link>
                        {!token && (
                            <Link to="/register" className="inline-flex items-center gap-2 bg-white/20 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/30 transition-all border border-white/30">
                                Đăng ký tài khoản
                            </Link>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
