import { useState, useEffect } from 'react';
import { Tag, Package, TrendingUp, Search, RefreshCw, BarChart3 } from 'lucide-react';
import { fetchPosts } from '../../api/posts.api';

export default function SettingsCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalPosts, setTotalPosts] = useState(0);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            // Lấy tất cả bài đăng để thống kê
            const result = await fetchPosts({ page: 1, limit: 500 });
            if (result && result.data) {
                setTotalPosts(result.pagination?.total || result.data.length);
                
                // Thống kê theo itemType
                const typeMap = {};
                result.data.forEach(post => {
                    if (post.itemType) {
                        const type = post.itemType.trim();
                        if (!typeMap[type]) {
                            typeMap[type] = {
                                name: type,
                                count: 0,
                                lost: 0,
                                found: 0,
                                pending: 0,
                                approved: 0,
                                completed: 0
                            };
                        }
                        typeMap[type].count++;
                        if (post.category === 'lost') typeMap[type].lost++;
                        if (post.category === 'found') typeMap[type].found++;
                        if (post.status === 'pending') typeMap[type].pending++;
                        if (post.status === 'approved') typeMap[type].approved++;
                        if (post.status === 'completed') typeMap[type].completed++;
                    }
                });

                // Chuyển thành array và sắp xếp theo số lượng
                const categoriesArr = Object.values(typeMap).sort((a, b) => b.count - a.count);
                setCategories(categoriesArr);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const maxCount = Math.max(...categories.map(c => c.count), 1);

    // Màu sắc cho từng loại
    const getColorClass = (index) => {
        const colors = [
            'from-blue-500 to-blue-600',
            'from-purple-500 to-purple-600',
            'from-emerald-500 to-emerald-600',
            'from-orange-500 to-orange-600',
            'from-pink-500 to-pink-600',
            'from-cyan-500 to-cyan-600',
            'from-amber-500 to-amber-600',
            'from-indigo-500 to-indigo-600',
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <Tag className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Danh mục đồ vật</h1>
                        <p className="text-gray-500">Thống kê các loại đồ vật trong hệ thống</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Tag className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{categories.length}</p>
                            <p className="text-xs text-gray-500">Loại đồ vật</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Package className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{totalPosts}</p>
                            <p className="text-xs text-gray-500">Tổng bài đăng</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <Search className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">
                                {categories.reduce((sum, c) => sum + c.lost, 0)}
                            </p>
                            <p className="text-xs text-gray-500">Đồ thất lạc</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">
                                {categories.reduce((sum, c) => sum + c.found, 0)}
                            </p>
                            <p className="text-xs text-gray-500">Đồ nhặt được</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Refresh */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm loại đồ vật..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <button
                        onClick={loadCategories}
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Categories Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
                <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-gray-800">Biểu đồ phân bố</h3>
                </div>
                
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="text-center py-12">
                        <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Không tìm thấy loại đồ vật nào</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredCategories.slice(0, 10).map((cat, index) => (
                            <div key={cat.name} className="group">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 bg-gradient-to-br ${getColorClass(index)} rounded-xl flex items-center justify-center text-white font-bold text-sm`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{cat.name}</p>
                                            <p className="text-xs text-gray-500">
                                                🔍 {cat.lost} thất lạc • ✨ {cat.found} nhặt được
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-gray-800">{cat.count}</p>
                                        <p className="text-xs text-gray-500">bài đăng</p>
                                    </div>
                                </div>
                                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full bg-gradient-to-r ${getColorClass(index)} rounded-full transition-all duration-500 group-hover:opacity-80`}
                                        style={{ width: `${(cat.count / maxCount) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Categories Grid */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-gray-800">Tất cả loại đồ vật ({filteredCategories.length})</h3>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Không có dữ liệu</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredCategories.map((cat, index) => (
                            <div
                                key={cat.name}
                                className="relative bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-4 hover:shadow-lg hover:border-blue-300 transition-all group"
                            >
                                <div className={`absolute top-3 right-3 w-8 h-8 bg-gradient-to-br ${getColorClass(index)} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>
                                    #{index + 1}
                                </div>
                                
                                <div className="mb-3">
                                    <Package className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                </div>
                                
                                <h4 className="font-semibold text-gray-800 mb-2 truncate" title={cat.name}>
                                    {cat.name}
                                </h4>
                                
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Tổng:</span>
                                        <span className="font-semibold text-gray-800">{cat.count}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-orange-500">Thất lạc:</span>
                                        <span className="font-semibold text-orange-600">{cat.lost}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-emerald-500">Nhặt được:</span>
                                        <span className="font-semibold text-emerald-600">{cat.found}</span>
                                    </div>
                                </div>

                                {/* Status badges */}
                                <div className="flex gap-1 mt-3 flex-wrap">
                                    {cat.pending > 0 && (
                                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                            {cat.pending} chờ
                                        </span>
                                    )}
                                    {cat.completed > 0 && (
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                            {cat.completed} xong
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
