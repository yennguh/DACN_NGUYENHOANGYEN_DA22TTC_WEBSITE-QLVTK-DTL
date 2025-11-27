import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Clock, Eye, ContactRound, LayoutGrid, Filter, Package } from "lucide-react";
import { fetchPosts } from "../../api/posts.api";
import { AuthContext } from "../../core/AuthContext";
import { jwtDecode } from "jwt-decode";
import { getImageUrl } from '../../utils/constant';

const LostItems = () => {
    const navigate = useNavigate();
    const { token, user: authUser } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState(""); // 'lost' or 'found' or ''
    const [itemTypeFilter, setItemTypeFilter] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [showMyPosts, setShowMyPosts] = useState(false); // Tùy chọn xem bài đăng của mình
    const [currentUserId, setCurrentUserId] = useState(null);
    const [isAdminLocal, setIsAdminLocal] = useState(false);

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setCurrentUserId(decoded._id || null);
                const roles = decoded.roles || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || [];
                setIsAdminLocal((Array.isArray(roles) && roles.includes('admin')) || roles === 'admin');
            } catch (err) {
                setCurrentUserId(null);
                setIsAdminLocal(false);
            }
        } else {
            setCurrentUserId(null);
            setIsAdminLocal(false);
        }
    }, [token]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let userId = null;
            if (token && showMyPosts) {
                try {
                    const decoded = jwtDecode(token);
                    userId = decoded._id;
                } catch (err) {
                    console.error('Error decoding token:', err);
                }
            }

            const params = {
                page: 1,
                limit: 20,
                // Nếu xem bài đăng của mình thì không filter status.
                // Nếu không đăng nhập thì chỉ hiển thị bài đã duyệt; nếu đã đăng nhập thì cho xem tất cả bài của mọi người
                ...(!showMyPosts && !token && { status: 'approved' }),
                ...(userId && showMyPosts && { userId }),
                ...(categoryFilter && { category: categoryFilter }),
                ...(itemTypeFilter && { itemType: itemTypeFilter }),
                ...(locationFilter && { location: locationFilter }),
                ...(searchTerm && { search: searchTerm })
            };
            const result = await fetchPosts(params);
            if (result && result.data) {
                setPosts(result.data);
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
    }, [categoryFilter, itemTypeFilter, locationFilter, searchTerm, showMyPosts]);

    // If the logged-in user updates their avatar/name, update posts in the current list
    useEffect(() => {
        if (!authUser) return;
        setPosts((prev) => prev.map(p => {
            try {
                if (p.user && authUser && (p.user._id === authUser._id || p.user._id === authUser._id)) {
                    return { ...p, user: { ...p.user, avatar: authUser.avatar, fullname: authUser.fullname } };
                }
            } catch (err) {
                // ignore
            }
            return p;
        }));
    }, [authUser]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchData();
    };

  return (
    <div className="p-10 flex flex-col items-center">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 w-full md:w-1/2">
                <h1 className="text-3xl font-bold uppercase text-gray-800">
                    Đồ bị thất lạc
                </h1>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Toggle xem bài đăng của mình (nếu đã đăng nhập) */}
                    {token && (
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showMyPosts}
                                onChange={(e) => setShowMyPosts(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm text-gray-700">Bài đăng của tôi</span>
                        </label>
                    )}

                    {/* Search box */}
                    <form onSubmit={handleSearch} className="flex items-center gap-3 flex-1 md:flex-initial">
                        <div className="flex items-center border rounded-full px-4 py-2 w-full md:w-72">
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 outline-none bg-transparent"
                            />
                            <button type="submit">
                                <Search className="text-red-500 w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Filters */}
            <div className="w-full md:w-1/2 mb-6 bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold">Bộ lọc</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại tin</label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Tất cả</option>
                            <option value="lost">Đồ thất lạc</option>
                            <option value="found">Đồ nhặt được</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại đồ vật</label>
                        <input
                            type="text"
                            value={itemTypeFilter}
                            onChange={(e) => setItemTypeFilter(e.target.value)}
                            placeholder="VD: Điện thoại, Ví..."
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí</label>
                        <input
                            type="text"
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            placeholder="VD: Thư viện, Căn tin..."
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
          </div>
        </div>
      </div>

            {/* Loading */}
            {loading && (
                <div className="w-full md:w-1/2 text-center py-8">
                    <div className="text-gray-500">Đang tải...</div>
                </div>
            )}

      {/* List cards */}
            {!loading && posts.length === 0 && (
                <div className="w-full md:w-1/2 text-center py-8">
                    <div className="text-gray-500">Không có bài đăng nào</div>
                </div>
            )}

            {!loading && (
      <div className="flex flex-col items-center gap-6 w-full md:w-1/2">
                    {posts.map((item) => (
          <div
                            key={item._id}
                            className="w-full bg-white border rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
                            onClick={() => navigate(`/baidang/${item._id}`)}
          >
                            {/* User info */}
                            <div className="flex items-center gap-3 p-4 border-b">
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    { (item.user?.avatar || item.authorAvatar) ? (
                                        <img
                                            src={getImageUrl(item.user?.avatar || item.authorAvatar)}
                                            alt={item.user?.fullname || 'User'}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                try {
                                                    if (e && e.target) {
                                                        e.target.style.display = 'none';
                                                        const next = e.target.nextElementSibling;
                                                        if (next && next.style) next.style.display = 'flex';
                                                    }
                                                } catch (err) {
                                                    // ignore
                                                }
                                            }}
                                        />
                                    ) : (
                                        <span className="text-gray-600 font-semibold text-sm">
                                            {item.user?.fullname?.substring(0, 2).toUpperCase() || 'U'}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-gray-800">
                                                {item.user?.fullname || 'Người dùng'}
                                            </h4>
                                            <h5 className="text-sm text-gray-600">
                                                {item.category === 'lost' ? 'Đồ thất lạc' : 'Đồ nhặt được'}
                                            </h5>
                                        </div>
                                        {item.status === 'pending' && (showMyPosts || isAdminLocal || item.userId === currentUserId) && (
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                                Chờ duyệt
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center text-gray-500 text-sm">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                    </div>
                                </div>
                            </div>

                            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-800 px-4 py-3">
              {item.title}
            </h3>

                            {/* Image */}
                            {item.images && item.images.length > 0 && (
            <div className="relative w-full">
              <img
                                        src={item.images[0]}
                alt={item.title}
                                        className="w-full h-96 object-cover"
              />
                                    {item.images.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-white text-gray-800 text-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow">
                                            <LayoutGrid className="w-4 h-4" /> {item.images.length} ảnh
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Meta info */}
                            <div className="px-4 py-3 border-t flex items-center justify-between text-sm text-gray-600">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <Package className="w-4 h-4" />
                                        {item.itemType}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <ContactRound className="w-4 h-4" />
                                        {item.location}
                                    </span>
              </div>
            </div>

                            {/* Actions */}
                            <div className="flex justify-between px-4 py-4 border-t">
              <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/baidang/${item._id}`);
                                    }}
                className="flex items-center gap-1 px-3 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                                    <Eye className="w-4 h-4" /> Xem chi tiết
              </button>

                                {item.contactInfo?.phone && (
                                    <a
                                        href={`tel:${item.contactInfo.phone}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex items-center gap-1 px-3 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
                                    >
                <ContactRound className="w-4 h-4" /> Liên hệ
                                    </a>
                                )}
            </div>
          </div>
        ))}
      </div>
            )}
    </div>
  );
};

export default LostItems;
