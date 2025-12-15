import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSection from './components/AdminSection';
import { fetchPosts, deletePost, updateReturnStatus, approvePost, rejectPost } from '../../api/posts.api';
import { Search, Trash2, Send, RotateCcw, Eye, CircleAlert, HandHelping, Check, X } from 'lucide-react';
import { getImageUrl } from '../../utils/constant';

export default function FoundItemsList() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Chia bài đăng theo category
    const lostPosts = posts.filter(p => p.category === 'lost');
    const foundPosts = posts.filter(p => p.category === 'found');

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                page: 1,
                limit: 100,
                ...(search && { search })
            };
            const result = await fetchPosts(params);
            if (result && result.data) {
                setPosts(result.data);
            }
        } catch (error) {
            console.error("Error fetching found items:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkReturned = async (id) => {
        try {
            await updateReturnStatus(id, 'gửi trả');
            fetchData();
        } catch (error) {
            alert('Có lỗi xảy ra');
        }
    };

    const handleMarkNotFound = async (id) => {
        try {
            await updateReturnStatus(id, 'chưa tìm thấy');
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
            alert('Có lỗi xảy ra khi xóa');
        }
    };

    const handleApprove = async (id) => {
        try {
            await approvePost(id);
            fetchData();
        } catch (error) {
            alert('Có lỗi xảy ra');
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectPost(id);
            fetchData();
        } catch (error) {
            alert('Có lỗi xảy ra');
        }
    };

    // Component bảng dùng chung
    const PostTable = ({ data, title, icon: Icon, headerColor }) => (
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
                            {data.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-3 px-4">
                                        <p className="font-medium text-gray-800 max-w-[150px] truncate">{item.title}</p>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {item.user?.avatar ? (
                                                    <img src={getImageUrl(item.user.avatar)} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-white text-xs font-bold">{(item.authorFullname || item.user?.fullname || 'U').charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <span className="text-gray-700 text-sm">{item.authorFullname || item.user?.fullname || 'Ẩn danh'}</span>
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
                                            {item.status === 'approved' && (
                                                <>
                                                    <button onClick={() => handleMarkReturned(item._id)} className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Đã trả">
                                                        <Send className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleMarkNotFound(item._id)} className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg" title="Chưa thấy">
                                                        <RotateCcw className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            <button onClick={() => handleDelete(item._id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Xóa">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return (
        <AdminSection title="Quản lý bài đăng">
            <div className="space-y-6">
                {/* Search */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm đồ vật..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
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
                        {/* Bảng Đồ bị mất đã trả */}
                        <PostTable 
                            data={lostPosts} 
                            title="🔍 Đồ bị mất - Đã trả" 
                            icon={CircleAlert}
                            headerColor="bg-gradient-to-r from-red-500 to-orange-500 text-white"
                        />

                        {/* Bảng Đồ nhặt được đã trả */}
                        <PostTable 
                            data={foundPosts} 
                            title="✨ Đồ nhặt được - Đã trả" 
                            icon={HandHelping}
                            headerColor="bg-gradient-to-r from-green-500 to-teal-500 text-white"
                        />
                    </>
                )}
            </div>
        </AdminSection>
    );
}
