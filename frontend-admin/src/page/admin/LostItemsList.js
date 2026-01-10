import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Trash2, Check, X, Send, RotateCcw, CircleAlert, HandHelping, CheckCircle, Share2, Shield, Flag, Ban } from 'lucide-react';
import { getImageUrl } from '../../utils/constant';
import { fetchPosts, deletePost, approvePost, rejectPost, updateReturnStatus, banPost } from '../../api/posts.api';
import { fetchReports } from '../../api/reports.api';
import AdminSection from './components/AdminSection';

export default function LostItemsList() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilters, setStatusFilters] = useState(['approved']); // Mảng các status được chọn
    const [postTypeFilter, setPostTypeFilter] = useState('all'); // 'all', 'admin', 'user'

    // Toggle status filter
    const toggleStatusFilter = (status) => {
        setStatusFilters(prev => {
            if (prev.includes(status)) {
                // Nếu đã có thì bỏ ra (nhưng phải còn ít nhất 1)
                const newFilters = prev.filter(s => s !== status);
                return newFilters.length > 0 ? newFilters : prev;
            } else {
                // Nếu chưa có thì thêm vào
                return [...prev, status];
            }
        });
    };

    // Lấy danh sách postId bị tố cáo (chưa xử lý)
    const reportedPostIds = reports.filter(r => r.status === 'pending' || r.status === 'reviewed').map(r => r.postId);
    
    // Filter bài theo status được chọn
    const filteredByStatus = posts.filter(p => {
        // Pending luôn hiển thị riêng
        if (p.status === 'pending') return true;
        // Bài bị cấm luôn hiển thị riêng
        if (p.banned) return true;
        // Bài bị tố cáo luôn hiển thị riêng
        if (reportedPostIds.includes(p._id)) return true;
        // Filter theo status được chọn
        return statusFilters.includes(p.status);
    });
    
    // Chia bài đăng theo category và trạng thái
    const pendingPosts = filteredByStatus.filter(p => p.status === 'pending');
    const reportedPosts = filteredByStatus.filter(p => reportedPostIds.includes(p._id) && !p.banned && p.status !== 'pending');
    const bannedPosts = filteredByStatus.filter(p => p.banned);
    const sharedPosts = filteredByStatus.filter(p => p.isShared && p.status !== 'pending' && !p.banned && !reportedPostIds.includes(p._id));
    const lostPosts = filteredByStatus.filter(p => p.category === 'lost' && !p.isShared && p.status !== 'pending' && !p.banned && !reportedPostIds.includes(p._id));
    const foundPosts = filteredByStatus.filter(p => p.category === 'found' && !p.isShared && p.status !== 'pending' && !p.banned && !reportedPostIds.includes(p._id));
    const completedPosts = filteredByStatus.filter(p => p.status === 'completed' && !p.banned && !reportedPostIds.includes(p._id));

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                page: 1,
                limit: 200,
                includeBanned: true, // Lấy cả bài bị cấm
                ...(searchTerm && { search: searchTerm })
            };
            const [postsResult, reportsResult] = await Promise.all([
                fetchPosts(params),
                fetchReports({ page: 1, limit: 100 })
            ]);
            
            if (postsResult && postsResult.data) {
                setPosts(postsResult.data);
            } else {
                setPosts([]);
            }
            
            if (reportsResult && reportsResult.data) {
                setReports(reportsResult.data);
            } else {
                setReports([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setPosts([]);
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    const handleApprove = async (postId) => {
        try {
            await approvePost(postId);
            fetchData();
        } catch (error) {
            alert('Có lỗi xảy ra khi duyệt bài đăng');
        }
    };

    const handleReject = async (postId) => {
        try {
            await rejectPost(postId);
            fetchData();
        } catch (error) {
            alert('Có lỗi xảy ra khi từ chối bài đăng');
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm('Xóa bài đăng này?')) return;
        try {
            await deletePost(postId);
            fetchData();
        } catch (error) {
            alert('Có lỗi xảy ra khi xóa bài đăng');
        }
    };

    const handleMarkReturned = async (postId) => {
        try {
            await updateReturnStatus(postId, 'gửi trả');
            fetchData();
        } catch (error) {
            alert('Có lỗi xảy ra');
        }
    };

    const handleMarkNotFound = async (postId) => {
        try {
            await updateReturnStatus(postId, 'chưa tìm thấy');
            fetchData();
        } catch (error) {
            alert('Có lỗi xảy ra');
        }
    };

    const handleBanPost = async (postId) => {
        const reason = window.prompt('Nhập lý do cấm bài đăng:');
        if (!reason) return;
        try {
            await banPost(postId, reason);
            alert('Đã cấm bài đăng thành công!');
            fetchData();
        } catch (error) {
            alert('Có lỗi xảy ra khi cấm bài đăng');
        }
    };

    // Lấy số lượng tố cáo cho bài đăng
    const getReportCount = (postId) => {
        return reports.filter(r => r.postId === postId && (r.status === 'pending' || r.status === 'reviewed')).length;
    };

    // Hàm lấy avatar URL
    const getAvatarUrl = (item) => {
        const avatar = item.authorAvatar || item.user?.avatar;
        if (!avatar) return null;
        if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
        return getImageUrl(avatar);
    };

    // Hàm lấy tên hiển thị
    const getDisplayName = (item) => {
        return item.authorFullname || item.user?.fullname || 'Ẩn danh';
    };

    // Kiểm tra xem bài đăng có phải của admin không
    const isAdminPost = (item) => {
        return item.isAdminPost || item.user?.roles?.includes('admin') || item.authorFullname?.toLowerCase() === 'admin';
    };

    // Filter posts theo loại người đăng
    const filterByPostType = (items) => {
        if (postTypeFilter === 'all') return items;
        return items.filter(item => {
            const isAdmin = isAdminPost(item);
            if (postTypeFilter === 'admin') return isAdmin;
            if (postTypeFilter === 'user') return !isAdmin;
            return true;
        });
    };

    // Component bảng dùng chung
    const PostTable = ({ data, title, icon: Icon, headerColor, showReturnActions = true, showReportCount = false, showBanAction = false }) => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className={`p-4 border-b ${headerColor} flex items-center gap-3`}>
                <Icon className="w-5 h-5" />
                <h2 className="font-bold text-lg">{title}</h2>
                <span className="ml-auto bg-white/20 px-3 py-1 rounded-full text-sm font-medium">{data.length} bài</span>
            </div>
            {data.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Không có bài đăng nào</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/80">
                            <tr>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Tiêu đề</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Người đăng</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Loại đồ</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Vị trí</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Ngày</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Trạng thái</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Trả đồ</th>
                                <th className="text-right text-xs font-semibold text-gray-500 uppercase py-3 px-4">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.map((item) => {
                                const avatarUrl = getAvatarUrl(item);
                                const displayName = getDisplayName(item);
                                return (
                                    <tr key={item._id} className={`hover:bg-gray-50/50 transition-colors ${item.isShared ? 'bg-gradient-to-r from-pink-50/50 to-purple-50/50' : ''}`}>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <p className={`font-medium max-w-[180px] truncate ${item.isShared ? 'text-pink-600' : 'text-gray-800'}`}>{item.title}</p>
                                                {item.isShared && (
                                                    <span className="px-1.5 py-0.5 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 rounded-full text-xs font-bold flex items-center gap-0.5 border border-pink-200">
                                                        <Share2 className="w-3 h-3" /> Chia sẻ
                                                    </span>
                                                )}
                                                {showReportCount && getReportCount(item._id) > 0 && (
                                                    <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-bold flex items-center gap-0.5">
                                                        <Flag className="w-3 h-3" /> {getReportCount(item._id)}
                                                    </span>
                                                )}
                                                {item.banned && (
                                                    <span className="px-1.5 py-0.5 bg-gray-800 text-white rounded-full text-xs font-bold flex items-center gap-0.5">
                                                        <Ban className="w-3 h-3" /> Bị cấm
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`relative w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${
                                                    isAdminPost(item) 
                                                        ? 'ring-2 ring-purple-500 ring-offset-1 bg-gradient-to-br from-purple-500 to-pink-500' 
                                                        : 'bg-gradient-to-br from-blue-400 to-violet-500'
                                                }`}>
                                                    {avatarUrl ? (
                                                        <img 
                                                            src={avatarUrl} 
                                                            alt={displayName} 
                                                            className="w-full h-full object-cover" 
                                                            onError={(e) => { 
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                                                            }}
                                                        />
                                                    ) : null}
                                                    <span className={`text-white text-xs font-bold ${avatarUrl ? 'hidden' : ''}`}>
                                                        {displayName.charAt(0).toUpperCase()}
                                                    </span>
                                                    {isAdminPost(item) && (
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center border-2 border-white">
                                                            <Shield className="w-2.5 h-2.5 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-sm ${isAdminPost(item) ? 'font-semibold text-purple-700' : 'text-gray-700'}`}>
                                                        {displayName}
                                                    </span>
                                                    {isAdminPost(item) && (
                                                        <span className="text-[10px] font-medium text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 w-fit">
                                                            <Shield className="w-2.5 h-2.5" /> Admin
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 text-sm">{item.itemType}</td>
                                        <td className="py-3 px-4 text-gray-600 text-sm">{item.location}</td>
                                        <td className="py-3 px-4 text-gray-500 text-sm">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                item.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                item.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {item.status === 'approved' ? 'Đã duyệt' : item.status === 'pending' ? 'Chờ duyệt' : item.status === 'rejected' ? 'Từ chối' : 'Hoàn thành'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {item.returnStatus === 'gửi trả' ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Đã trả</span>
                                            ) : item.returnStatus === 'chưa tìm thấy' ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">Chưa thấy</span>
                                            ) : (
                                                <span className="text-gray-400 text-sm">—</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => navigate(`/admin/posts/${item._id}`)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Xem">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {item.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => handleApprove(item._id)} className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Duyệt">
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleReject(item._id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Từ chối">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {showReturnActions && item.status === 'approved' && item.returnStatus !== 'gửi trả' && (
                                                    <>
                                                        <button onClick={() => handleMarkReturned(item._id)} className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Đã trả">
                                                            <Send className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleMarkNotFound(item._id)} className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg" title="Chưa thấy">
                                                            <RotateCcw className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {showBanAction && !item.banned && (
                                                    <button onClick={() => handleBanPost(item._id)} className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg" title="Cấm bài đăng">
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(item._id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Xóa">
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
    );

    return (
        <AdminSection title="Quản lý bài đăng" description="Quản lý bài đăng do người dùng tạo">
            <div className="space-y-6">
                {/* Search and Filters */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 relative min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
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
                    
                    {/* Filter theo trạng thái - có thể chọn nhiều */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => toggleStatusFilter('approved')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border-2 ${
                                statusFilters.includes('approved') 
                                    ? 'bg-green-50 border-green-500 text-green-700' 
                                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                        >
                            ✓ Đã duyệt
                        </button>
                        <button
                            onClick={() => toggleStatusFilter('rejected')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border-2 ${
                                statusFilters.includes('rejected') 
                                    ? 'bg-red-50 border-red-500 text-red-700' 
                                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                        >
                            ✗ Từ chối
                        </button>
                        <button
                            onClick={() => toggleStatusFilter('completed')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border-2 ${
                                statusFilters.includes('completed') 
                                    ? 'bg-purple-50 border-purple-500 text-purple-700' 
                                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                        >
                            ★ Hoàn thành
                        </button>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                        Tổng: <span className="font-bold text-blue-600">{posts.length}</span> bài đăng
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <div className="text-gray-500">Đang tải...</div>
                    </div>
                ) : (
                    <>
                        {/* Bảng Chờ duyệt */}
                        {filterByPostType(pendingPosts).length > 0 && (
                            <PostTable 
                                data={filterByPostType(pendingPosts)} 
                                title="⏳ Chờ duyệt" 
                                icon={RotateCcw}
                                headerColor="bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
                            />
                        )}

                        {/* Bảng Bài đăng bị tố cáo */}
                        {filterByPostType(reportedPosts).length > 0 && (
                            <PostTable 
                                data={filterByPostType(reportedPosts)} 
                                title="🚨 Bài đăng bị tố cáo" 
                                icon={Flag}
                                headerColor="bg-gradient-to-r from-rose-500 to-red-600 text-white"
                                showReportCount={true}
                                showBanAction={true}
                            />
                        )}

                        {/* Bảng Bài đăng bị cấm */}
                        {filterByPostType(bannedPosts).length > 0 && (
                            <PostTable 
                                data={filterByPostType(bannedPosts)} 
                                title="🚫 Bài đăng bị cấm" 
                                icon={Ban}
                                headerColor="bg-gradient-to-r from-gray-600 to-gray-800 text-white"
                                showReturnActions={false}
                            />
                        )}

                        {/* Bảng Bài đăng được chia sẻ */}
                        {filterByPostType(sharedPosts).length > 0 && (
                            <PostTable 
                                data={filterByPostType(sharedPosts)} 
                                title="🔗 Bài đăng được chia sẻ" 
                                icon={Share2}
                                headerColor="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                            />
                        )}

                        {/* Bảng Đồ bị mất */}
                        <PostTable 
                            data={filterByPostType(lostPosts)} 
                            title="🔍 Đồ bị mất" 
                            icon={CircleAlert}
                            headerColor="bg-gradient-to-r from-red-500 to-orange-500 text-white"
                        />

                        {/* Bảng Đồ nhặt được */}
                        <PostTable 
                            data={filterByPostType(foundPosts)} 
                            title="✨ Đồ nhặt được" 
                            icon={HandHelping}
                            headerColor="bg-gradient-to-r from-green-500 to-teal-500 text-white"
                        />

                        {/* Bảng Hoàn thành */}
                        {filterByPostType(completedPosts).length > 0 && (
                            <PostTable 
                                data={filterByPostType(completedPosts)} 
                                title="✅ Hoàn thành" 
                                icon={CheckCircle}
                                headerColor="bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                                showReturnActions={false}
                            />
                        )}
                    </>
                )}
            </div>
        </AdminSection>
    );
}
