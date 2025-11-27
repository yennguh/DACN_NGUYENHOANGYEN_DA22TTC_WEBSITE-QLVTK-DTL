import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Star, TrendingUp } from 'lucide-react';
import { fetchTopPosters } from '../../api/posts.api';

const TopPosters = () => {
    const [topPosters, setTopPosters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadTopPosters = async () => {
            try {
                console.log('Fetching top posters...');
                const result = await fetchTopPosters();
                console.log('TopPosters API result:', result); // Debug log
                
                // Kiểm tra nhiều cấu trúc response có thể có
                let data = null;
                if (result?.data && Array.isArray(result.data)) {
                    data = result.data;
                } else if (Array.isArray(result)) {
                    data = result;
                } else if (result?.data?.data && Array.isArray(result.data.data)) {
                    data = result.data.data;
                }
                
                if (data && data.length > 0) {
                    console.log('Found top posters:', data.length);
                    setTopPosters(data.slice(0, 5)); // Top 5
                } else {
                    console.log('No top posters data available. Result structure:', result);
                }
            } catch (error) {
                console.error('Error loading top posters:', error);
                console.error('Error details:', error.response?.data || error.message);
                setError(error.response?.data?.message || error.message || 'Không thể tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };
        loadTopPosters();
    }, []);

    const getRankIcon = (index) => {
        switch (index) {
            case 0:
                return <Trophy className="w-6 h-6 text-yellow-500" />;
            case 1:
                return <Medal className="w-6 h-6 text-gray-400" />;
            case 2:
                return <Award className="w-6 h-6 text-amber-600" />;
            default:
                return <Star className="w-5 h-5 text-blue-500" />;
        }
    };

    const getRankBadge = (index) => {
        switch (index) {
            case 0:
                return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
            case 1:
                return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white';
            case 2:
                return 'bg-gradient-to-r from-amber-500 to-amber-700 text-white';
            default:
                return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
        }
    };

    // Hiển thị loading state
    if (loading) {
        return (
            <div className="w-full py-8 px-4 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="text-gray-500">Đang tải bảng khen thưởng...</div>
                </div>
            </div>
        );
    }

    // Hiển thị message nếu có lỗi
    if (error) {
        return (
            <div className="w-full py-8 px-4 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center">
                        <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-600 mb-2">Bảng Khen Thưởng</h2>
                        <p className="text-red-500 mb-2">Lỗi: {error}</p>
                        <p className="text-gray-500 text-sm">Vui lòng thử lại sau hoặc đăng nhập để xem thống kê.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Hiển thị message nếu không có data
    if (!topPosters || topPosters.length === 0) {
        return (
            <div className="w-full py-8 px-4 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center">
                        <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-600 mb-2">Bảng Khen Thưởng</h2>
                        <p className="text-gray-500">Chưa có dữ liệu thống kê. Hãy đăng bài để trở thành người đăng bài xuất sắc!</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full py-8 px-4 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg">
                            <Trophy className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Bảng Khen Thưởng
                        </h2>
                        <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg">
                            <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <p className="text-gray-600 text-lg">Những thành viên tích cực đóng góp cho cộng đồng</p>
                </div>

                {/* Top Posters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topPosters.map((poster, index) => (
                        <div
                            key={poster.userId || index}
                            className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                                index === 0 ? 'md:col-span-2 lg:col-span-1 lg:row-span-1' : ''
                            }`}
                        >
                            {/* Rank Badge */}
                            <div className={`absolute top-4 right-4 ${getRankBadge(index)} px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2`}>
                                {getRankIcon(index)}
                                <span>#{index + 1}</span>
                            </div>

                            {/* Gradient Background for Top 3 */}
                            {index < 3 && (
                                <div className={`absolute top-0 left-0 right-0 h-2 ${
                                    index === 0 ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600' :
                                    index === 1 ? 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500' :
                                    'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700'
                                }`}></div>
                            )}

                            <div className="p-6">
                                {/* Avatar & Name */}
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg ${
                                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                        index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                                        index === 2 ? 'bg-gradient-to-r from-amber-500 to-amber-700' :
                                        'bg-gradient-to-r from-blue-400 to-blue-600'
                                    }`}>
                                        {poster.user?.fullname?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                                            {poster.user?.fullname || 'Ẩn danh'}
                                        </h3>
                                        <p className="text-sm text-gray-500 truncate">
                                            {poster.user?.email || 'Không có email'}
                                        </p>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-blue-600" />
                                            <span className="text-gray-700 font-medium">Tổng bài đăng</span>
                                        </div>
                                        <span className="text-2xl font-bold text-blue-600">
                                            {poster.totalPosts}
                                        </span>
                                    </div>

                                    {poster.latestPostAt && (
                                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                            <span className="font-medium">Bài gần nhất: </span>
                                            {new Date(poster.latestPostAt).toLocaleDateString('vi-VN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    )}

                                    {poster.user?.phone && (
                                        <div className="text-xs text-gray-500">
                                            📞 {poster.user.phone}
                                        </div>
                                    )}
                                </div>

                                {/* Special Badge for Top 1 */}
                                {index === 0 && (
                                    <div className="mt-4 pt-4 border-t border-yellow-200">
                                        <div className="flex items-center justify-center gap-2 text-yellow-600 font-semibold">
                                            <Star className="w-5 h-5 fill-yellow-500" />
                                            <span>Người đăng bài xuất sắc nhất</span>
                                            <Star className="w-5 h-5 fill-yellow-500" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Note */}
                <div className="text-center mt-8">
                    <p className="text-gray-500 text-sm">
                        💝 Cảm ơn các thành viên đã tích cực đóng góp cho cộng đồng!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TopPosters;

