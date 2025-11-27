import { FaFacebookF } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoHeader from "../public/assets/logo.jpg"; // giữ nguyên đường dẫn cũ
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../core/AuthContext";
import { fetchNotifications } from "../api/notifications.api";
import { getImageUrl } from "../utils/constant";
import { User } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { logout, token, user } = useContext(AuthContext);
  const [avatarErrored, setAvatarErrored] = useState(false);
  const location = useLocation(); // thêm để highlight trang hiện tại

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  useEffect(() => {
    if (token) {
      fetchUnreadNotifications();
    }
  }, [token]); // sửa dependency thành token

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

  // Danh sách menu + đường dẫn tương ứng
  const menuItems = [
    { name: "Trang chủ", path: "/" },
    { name: "Đồ thất lạc", path: "/" },
    { name: "Đăng tin", path: "/baidang/create" },
    { name: "Bảng Khen Thưởng", path: "/khen-thuong" },
    { name: "Liên hệ", path: "/lien-he" },
  ];

  return (
    <header className="w-full shadow-sm border-b bg-white">
      <div className="w-full mx-auto flex items-center justify-between py-2 px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link to="/">
            <img src={logoHeader} alt="logo" className="w-14 h-14 object-contain" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-5 text-sm font-medium">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-2 py-1 rounded-full transition ${
                location.pathname === item.path
                  ? "bg-red-100 text-red-600 font-semibold text-lg"
                  : "hover:text-red-600 text-lg"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User / Login */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-md"
              >
                {user.avatar && !avatarErrored ? (
                  <img 
                    src={getImageUrl(user.avatar)} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    onError={() => setAvatarErrored(true)}
                    onLoad={() => setAvatarErrored(false)}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                )}
                <span>
                  Xin chào, <span className="font-bold">{user.fullname}</span>
                </span>
              </button>

              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowDropdown(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 py-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      Thông tin cá nhân
                    </Link>
                    <Link
                      to="/baidang/mine"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      Bài đăng của tôi
                    </Link>
                    <Link
                      to="/thong-bao"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      Thông báo
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700">
                  Đăng nhập
                </button>
              </Link>
              <Link to="/register">
                <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md text-sm font-semibold hover:bg-red-50">
                  Đăng ký
                </button>
              </Link>
            </div>
          )}

          {/* Facebook icon */}
          <div className="flex items-center gap-2">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center border rounded-full hover:bg-gray-100"
            >
              <FaFacebookF className="text-lg" />
            </a>
          </div>

          {/* Notifications */}
          {token && (
            <button
              onClick={() => navigate('/thong-bao')}
              type="button"
              className="relative inline-flex items-center p-1 text-sm font-medium text-center"
            >
              <IoIosNotifications className="text-2xl" />
              {unreadCount > 0 && (
                <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </button>
          )}

        </div>
      </div>
    </header>
  );
}