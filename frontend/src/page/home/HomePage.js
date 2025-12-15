import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Package } from 'lucide-react';
import TopPosters from './TopPosters';
import { fetchPosts } from '../../api/posts.api';
import { PostListSkeleton } from '../../core/LoadingSpinner';
import PostCard from '../../components/PostCard';

const HomePage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    useEffect(() => {
        const loadPosts = async () => {
            try {
                setError(null);
                // Lấy bài đăng mới nhất đã được duyệt
                const result = await fetchPosts({ page: 1, limit: 6, status: 'approved' });
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
        loadPosts();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
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

            {/* Bài đăng mới nhất */}
            <section className="py-12 bg-gray-50">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">📋 Bài đăng mới nhất</h2>
                        <Link to="/do-that-lac" className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
                            Xem tất cả <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {loading && <PostListSkeleton count={3} />}

                    {!loading && error && (
                        <div className="text-center py-12 bg-red-50 rounded-xl">
                            <p className="text-red-500 mb-4">{error}</p>
                            <button 
                                onClick={() => window.location.reload()} 
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                Thử lại
                            </button>
                        </div>
                    )}

                    {!loading && !error && posts.length === 0 && (
                        <div className="text-center py-12">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Chưa có bài đăng nào</p>
                        </div>
                    )}

                    {!loading && posts.length > 0 && (
                        <div className="space-y-6">
                            {posts.map((item) => (
                                <PostCard key={item._id} item={item} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Top Posters - Bảng khen thưởng (compact) */}
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
                        <Link to="/register" className="inline-flex items-center gap-2 bg-white/20 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/30 transition-all border border-white/30">
                            Đăng ký tài khoản
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
