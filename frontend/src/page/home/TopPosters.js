import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Star, TrendingUp, Crown, ArrowRight } from 'lucide-react';
import { fetchTopPosters } from '../../api/posts.api';
import { TopPostersGridSkeleton } from '../../core/LoadingSpinner';
import { getImageUrl } from '../../utils/constant';

const TopPosters = ({ compact = false }) => {
    const navigate = useNavigate();
    const [topPosters, setTopPosters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadTopPosters = async () => {
            try {
                const result = await fetchTopPosters();
                let data = null;
                if (result?.data && Array.isArray(result.data)) {
                    data = result.data;
                } else if (Array.isArray(result)) {
                    data = result;
                } else if (result?.data?.data && Array.isArray(result.data.data)) {
                    data = result.data.data;
                }
                if (data && data.length > 0) {
                    setTopPosters(data.slice(0, compact ? 3 : 5));
                }
            } catch (err) {
                setError(err.message || 'Không thể tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };
        loadTopPosters();
    }, [compact]);

    const handleViewUserPosts = (userId) => {
        if (userId) {
            navigate(`/profile/${userId}`);
        }
    };

    const getRankStyle = (index) => {
        switch (index) {
            case 0: return { bg: 'from-yellow-400 to-orange-500', badge: 'bg-yellow-500' };
            case 1: return { bg: 'from-gray-300 to-gray-500', badge: 'bg-gray-400' };
            case 2: return { bg: 'from-amber-500 to-orange-600', badge: 'bg-amber-600' };
            default: return { bg: 'from-blue-500 to-indigo-600', badge: 'bg-blue-500' };
        }
    };

    // Compact version for HomePage - white background like full version
    if (compact) {
        if (loading) {
            return (
                <section className="py-8 bg-gray-50">
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
                                <Trophy className="w-6 h-6 text-yellow-500" /> Bảng Khen Thưởng
                            </h2>
                        </div>
                        <div className="flex justify-center gap-4">
                            {[1,2,3].map(i => (
                                <div key={i} className="w-24 h-32 bg-gray-200 rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                </section>
            );
        }

        if (error || !topPosters || topPosters.length === 0) return null;

        return (
            <section className="py-12 bg-gray-50">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <Trophy className="w-8 h-8 text-yellow-500" /> Top đóng góp
                        </h2>
                        <button onClick={() => navigate('/khen-thuong')} className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-base font-semibold">
                            Xem tất cả <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex justify-center items-end gap-6">
                        {topPosters[1] && (
                            <div onClick={() => handleViewUserPosts(topPosters[1].userId)} className="cursor-pointer group">
                                <div className="bg-white rounded-2xl p-6 text-center border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all min-w-[140px]">
                                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gray-300 to-gray-500 p-0.5 mb-3 group-hover:scale-110 transition-transform shadow-lg">
                                        <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                                            {topPosters[1].user?.avatar ? <img src={getImageUrl(topPosters[1].user.avatar)} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl font-bold text-gray-500">{topPosters[1].user?.fullname?.charAt(0) || 'U'}</span>}
                                        </div>
                                    </div>
                                    <div className="bg-gray-400 text-white text-sm px-3 py-1 rounded-full mb-2 inline-block font-bold">#2</div>
                                    <p className="text-gray-800 font-semibold truncate">{topPosters[1].user?.fullname || 'Ẩn danh'}</p>
                                    <p className="text-blue-600 font-bold text-xl mt-1">{topPosters[1].totalPosts} bài</p>
                                </div>
                            </div>
                        )}
                        {topPosters[0] && (
                            <div onClick={() => handleViewUserPosts(topPosters[0].userId)} className="cursor-pointer group -mt-6">
                                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 text-center border-2 border-yellow-300 hover:border-yellow-400 hover:shadow-2xl transition-all min-w-[180px]">
                                    <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                                    <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-1 mb-3 group-hover:scale-110 transition-transform shadow-xl">
                                        <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                                            {topPosters[0].user?.avatar ? <img src={getImageUrl(topPosters[0].user.avatar)} alt="" className="w-full h-full object-cover" /> : <span className="text-3xl font-bold text-amber-500">{topPosters[0].user?.fullname?.charAt(0) || 'U'}</span>}
                                        </div>
                                    </div>
                                    <div className="bg-yellow-500 text-white text-sm px-3 py-1 rounded-full mb-2 inline-block font-bold">#1</div>
                                    <p className="text-gray-800 font-bold text-lg truncate">{topPosters[0].user?.fullname || 'Ẩn danh'}</p>
                                    <p className="text-yellow-600 font-bold text-2xl mt-1">{topPosters[0].totalPosts} bài</p>
                                </div>
                            </div>
                        )}
                        {topPosters[2] && (
                            <div onClick={() => handleViewUserPosts(topPosters[2].userId)} className="cursor-pointer group">
                                <div className="bg-white rounded-2xl p-6 text-center border border-gray-200 hover:border-amber-300 hover:shadow-xl transition-all min-w-[140px]">
                                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-orange-600 p-0.5 mb-3 group-hover:scale-110 transition-transform shadow-lg">
                                        <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                                            {topPosters[2].user?.avatar ? <img src={getImageUrl(topPosters[2].user.avatar)} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl font-bold text-amber-600">{topPosters[2].user?.fullname?.charAt(0) || 'U'}</span>}
                                        </div>
                                    </div>
                                    <div className="bg-amber-600 text-white text-sm px-3 py-1 rounded-full mb-2 inline-block font-bold">#3</div>
                                    <p className="text-gray-800 font-semibold truncate">{topPosters[2].user?.fullname || 'Ẩn danh'}</p>
                                    <p className="text-blue-600 font-bold text-xl mt-1">{topPosters[2].totalPosts} bài</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        );
    }


    // Full version - white background
    if (loading) {
        return (
            <div className="w-full py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-black text-gray-800 flex items-center justify-center gap-4">
                            <Trophy className="w-10 h-10 text-yellow-500" /> Bảng Khen Thưởng <Trophy className="w-10 h-10 text-yellow-500" />
                        </h2>
                        <p className="text-gray-500 text-lg mt-2">Những thành viên tích cực nhất cộng đồng TVU</p>
                    </div>
                    <TopPostersGridSkeleton count={5} />
                </div>
            </div>
        );
    }

    if (error || !topPosters || topPosters.length === 0) {
        return (
            <div className="w-full py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">Bảng Khen Thưởng</h2>
                    <p className="text-gray-500">Chưa có dữ liệu thống kê</p>
                </div>
            </div>
        );
    }

    const topOne = topPosters[0];
    const others = topPosters.slice(1);

    return (
        <div className="w-full py-16 bg-gray-50">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-black text-gray-800 flex items-center justify-center gap-4 mb-2">
                        <Trophy className="w-10 h-10 text-yellow-500" /> 
                        <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">Bảng Khen Thưởng</span>
                        <Trophy className="w-10 h-10 text-yellow-500" />
                    </h2>
                    <p className="text-gray-500 text-lg">Click vào avatar để xem bài đăng của họ</p>
                </div>

                {/* Top 1 */}
                <div className="mb-10">
                    <div onClick={() => handleViewUserPosts(topOne.userId)} className="max-w-md mx-auto cursor-pointer group">
                        <div className="relative bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-xl transition-all">
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                                    <Crown className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full font-bold shadow-md">#1</div>
                            <div className="flex flex-col items-center text-center pt-4">
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-1 mb-4 group-hover:scale-110 transition-transform shadow-xl">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                                        {topOne.user?.avatar ? <img src={getImageUrl(topOne.user.avatar)} alt="" className="w-full h-full object-cover" /> : <span className="text-4xl font-black text-amber-500">{topOne.user?.fullname?.charAt(0) || 'U'}</span>}
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-1">{topOne.user?.fullname || 'Ẩn danh'}</h3>
                                <p className="text-gray-500 text-sm mb-4">{topOne.user?.email || ''}</p>
                                <div className="bg-white rounded-xl px-6 py-3 flex items-center gap-3 shadow-md border border-gray-100">
                                    <TrendingUp className="w-5 h-5 text-yellow-500" />
                                    <span className="text-gray-600">Tổng bài đăng:</span>
                                    <span className="text-3xl font-black text-yellow-500">{topOne.totalPosts}</span>
                                </div>
                                <p className="mt-4 text-yellow-600 font-semibold flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" /> Người đăng bài xuất sắc nhất <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Others */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {others.map((poster, idx) => {
                        const index = idx + 1;
                        const style = getRankStyle(index);
                        return (
                            <div key={poster.userId || index} onClick={() => handleViewUserPosts(poster.userId)} className="cursor-pointer group">
                                <div className="relative bg-white rounded-2xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-lg hover:scale-105 transition-all">
                                    <div className={`absolute -top-2 -right-2 w-8 h-8 ${style.badge} rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md`}>#{index + 1}</div>
                                    <div className="flex flex-col items-center text-center">
                                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${style.bg} p-0.5 mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                                            <div className="w-full h-full rounded-xl overflow-hidden bg-white flex items-center justify-center">
                                                {poster.user?.avatar ? <img src={getImageUrl(poster.user.avatar)} alt="" className="w-full h-full object-cover" /> : <span className="text-xl font-bold text-gray-600">{poster.user?.fullname?.charAt(0) || 'U'}</span>}
                                            </div>
                                        </div>
                                        <h3 className="text-gray-800 font-semibold truncate w-full text-sm">{poster.user?.fullname || 'Ẩn danh'}</h3>
                                        <p className="text-2xl font-black text-blue-600 mt-2">{poster.totalPosts}</p>
                                        <p className="text-gray-400 text-xs">bài đăng</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center mt-10">
                    <p className="text-gray-500">💝 Cảm ơn các thành viên đã tích cực đóng góp!</p>
                </div>
            </div>
        </div>
    );
};

export default TopPosters;
