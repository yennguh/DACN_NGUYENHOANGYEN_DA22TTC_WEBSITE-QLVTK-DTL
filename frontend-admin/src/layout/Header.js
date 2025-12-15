import { Link, useLocation, useNavigate } from "react-router-dom";
import logoHeader from "../public/assets/logo.jpg";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../core/AuthContext";
import { fetchNotifications } from "../api/notifications.api";
import { getImageUrl } from "../utils/constant";
import { User, Bell, Shield, LogIn, UserPlus, ChevronDown, Menu, X } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { logout, token, user } = useContext(AuthContext);
  const [avatarErrored, setAvatarErrored] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  useEffect(() => {
    if (token) {
      fetchUnreadNotifications();
    }
  }, [token]);

  const fetchUnreadNotifications = async () => {
    try {
      const result = await fetchNotifications({ page: 1, limit: 1, isRead: 'false' });
      if (result) {
        const unread = typeof result.unreadCount === 'number'
          ? result.unreadCount
          : result.meta?.unreadCount;
        setUnreadCount(unread || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const menuItems = [
    { name: "Trang chủ", path: "/" },
    { name: "Đồ thất lạc", path: "/do-that-lac" },
    { name: "Đăng tin", path: "/baidang/create" },
    { name: "Bảng Khen Thưởng", path: "/khen-thuong" },
    { name: "Liên hệ", path: "/lien-he" },
  ];

  return (
    <header className="w-full shadow-lg bg-white sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-2">
        <div className="w-full px-6 lg:px-12 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span>📞 Hotline: 0986 095 484</span>
            <span className="hidden md:inline">📧 hoangyen24042004@gmail.com</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://tvu.edu.vn" target="_blank" rel="noopener noreferrer" className="hover:underline">🏫 TVU</a>
            <a href="https://sinhvien.tvu.edu.vn" target="_blank" rel="noopener noreferrer" className="hover:underline hidden sm:inline">🎓 Cổng SV</a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="w-full px-6 lg:px-12 flex items-center justify-between py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-4 group">
          <div className="relative">
            <img 
              src={logoHeader} 
              alt="logo" 
              className="w-16 h-16 object-contain rounded-2xl shadow-lg group-hover:shadow-xl transition-all border-2 border-blue-100" 
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-xl">ĐH Trà Vinh</h1>
            <p className="text-sm text-gray-500">Hệ thống tìm kiếm đồ thất lạc</p>
          </div>
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden xl:flex items-center gap-2">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                location.pathname === item.path
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Admin Button */}
          <Link to="/admin/login" className="hidden lg:block">
            <button className="flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-slate-800 hover:to-black transition-all shadow-lg hover:shadow-xl">
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </Link>

          {user ? (
            <>
              {/* Notifications Bell */}
              <button
                onClick={() => navigate('/thong-bao')}
                className="relative p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all group border border-blue-100"
              >
                <Bell className="w-5 h-5 text-blue-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 px-4 py-2.5 rounded-xl transition-all border border-blue-100"
                >
                  {user.avatar && !avatarErrored ? (
                    <img 
                      src={getImageUrl(user.avatar)} 
                      alt="Avatar" 
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-200"
                      onError={() => setAvatarErrored(true)}
                      onLoad={() => setAvatarErrored(false)}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-800 max-w-[120px] truncate">{user.fullname}</p>
                    <p className="text-xs text-gray-500">Thành viên</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl z-20 py-2 border border-gray-100 overflow-hidden">
                      <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <p className="text-base font-bold text-gray-800">{user.fullname}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors" onClick={() => setShowDropdown(false)}>
                        <User className="w-5 h-5 text-blue-500" />
                        Thông tin cá nhân
                      </Link>
                      <Link to="/baidang/mine" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors" onClick={() => setShowDropdown(false)}>
                        <span className="text-lg">📝</span>
                        Bài đăng của tôi
                      </Link>
                      <Link to="/thong-bao" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors" onClick={() => setShowDropdown(false)}>
                        <Bell className="w-5 h-5 text-blue-500" />
                        Thông báo
                        {unreadCount > 0 && <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">{unreadCount}</span>}
                      </Link>
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <span className="text-lg">🚪</span>
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Đăng nhập</span>
                </button>
              </Link>
              <Link to="/register">
                <button className="flex items-center gap-2 border-2 border-blue-600 text-blue-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-all">
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Đăng ký</span>
                </button>
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="xl:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200">
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="xl:hidden bg-white border-t border-gray-200 py-4 px-6">
          <nav className="flex flex-col gap-2">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                onClick={() => setShowMobileMenu(false)}
                className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname === item.path
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    : "text-gray-600 hover:bg-blue-50"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link to="/admin/login" onClick={() => setShowMobileMenu(false)} className="px-4 py-3 rounded-xl text-sm font-semibold bg-slate-800 text-white mt-2">
              🛡️ Admin Panel
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
