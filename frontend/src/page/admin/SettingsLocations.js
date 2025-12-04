import React, { useState, useEffect } from 'react';
import AdminSection from './components/AdminSection';
import { MapPin } from 'lucide-react';
import { fetchPosts } from '../../api/posts.api';

export default function SettingsLocations() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLocations = async () => {
            try {
                const result = await fetchPosts({ limit: 1000 });
                if (result?.data) {
                    // Lấy danh sách vị trí unique từ các bài đăng
                    const locationMap = {};
                    result.data.forEach(post => {
                        if (post.location) {
                            const loc = post.location.trim();
                            if (locationMap[loc]) {
                                locationMap[loc].count++;
                            } else {
                                locationMap[loc] = { name: loc, count: 1 };
                            }
                        }
                    });
                    // Chuyển thành array và sắp xếp theo số lượng
                    const locationList = Object.values(locationMap).sort((a, b) => b.count - a.count);
                    setLocations(locationList);
                }
            } catch (error) {
                console.error('Error loading locations:', error);
            } finally {
                setLoading(false);
            }
        };
        loadLocations();
    }, []);

    // Màu sắc cho các vị trí
    const colors = [
        'bg-blue-100 text-blue-600',
        'bg-green-100 text-green-600',
        'bg-orange-100 text-orange-600',
        'bg-purple-100 text-purple-600',
        'bg-pink-100 text-pink-600',
        'bg-cyan-100 text-cyan-600',
        'bg-amber-100 text-amber-600',
        'bg-red-100 text-red-600',
        'bg-indigo-100 text-indigo-600',
        'bg-teal-100 text-teal-600',
    ];

    return (
        <AdminSection title="Vị trí trong khuôn viên trường">
            <div className="space-y-6">
                {/* Header info */}
                <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                            <MapPin className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Khuôn viên Đại học Trà Vinh</h2>
                            <p className="text-green-100 mt-1">Các vị trí từ bài đăng thất lạc</p>
                        </div>
                        <div className="ml-auto text-right">
                            <p className="text-3xl font-bold">{locations.length}</p>
                            <p className="text-green-100 text-sm">vị trí</p>
                        </div>
                    </div>
                </div>

                {/* Danh sách vị trí */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-800 text-lg mb-4">Danh sách các vị trí từ bài đăng</h3>
                    
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Đang tải...</div>
                    ) : locations.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">Chưa có vị trí nào từ bài đăng</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {locations.map((location, index) => (
                                <div 
                                    key={location.name} 
                                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                                >
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[index % colors.length]}`}>
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{location.name}</p>
                                        <p className="text-sm text-gray-500">{location.count} bài đăng</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Ghi chú */}
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                    <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="font-medium text-blue-800">Lưu ý</h4>
                            <p className="text-sm text-blue-600 mt-1">
                                Danh sách vị trí được tự động lấy từ các bài đăng. Số lượng bài đăng cho biết mức độ phổ biến của vị trí đó.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminSection>
    );
}

