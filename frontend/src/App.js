import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import './App.css';
import NetworkStatus from './components/NetworkStatus';
import HomePage from './page/home/HomePage';
import LostItemsPage from './page/home/LostItemsPage';
import LoginPage from './page/auth/LoginPage';
import RegisterPage from './page/auth/RegisterPage';
import ForgotPassword from './page/auth/ForgotPassword';
import MainLayout from './layout/Mainlayout';
import BaidangDetail from './page/baidang/BaidangDetail';
import BaidangCreate from './page/baidang/BaidangCreate';
import MyPosts from './page/baidang/MyPosts';
import Profile from './page/profile/Profile';
import Contact from './page/contact/Contact';
import Notifications from './page/notifications/Notifications';
import TopPostersPage from './page/topPosters/TopPostersPage';
import { AuthContext } from './core/AuthContext';

// Component kiểm tra và logout admin nếu họ truy cập trang User
function AdminGuard({ children }) {
  const { token, logout } = useContext(AuthContext);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userRole = decoded.roles || decoded.role || null;
        const isAdmin = userRole && (Array.isArray(userRole) ? userRole.includes("admin") : userRole === "admin");
        
        if (isAdmin) {
          // Logout admin và xóa cookies
          logout();
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Token invalid:", error);
      }
    }
  }, [token, logout]);

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AdminGuard>
        <NetworkStatus />
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Public & User Routes – dùng MainLayout */}
          <Route element={<MainLayout />}>
            {/* Trang chủ */}
            <Route path="/" element={<HomePage />} />
            
            {/* Trang đồ thất lạc */}
            <Route path="/do-that-lac" element={<LostItemsPage />} />
            <Route path="/user/:userId/posts" element={<LostItemsPage />} />

            {/* Trang bài đăng */}
            <Route path="/baidang/create" element={<BaidangCreate />} />
            <Route path="/baidang/:id" element={<BaidangDetail />} />
            <Route path="/baidang/mine" element={<MyPosts />} />

            {/* Trang hồ sơ cá nhân */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />

            {/* Trang liên hệ */}
            <Route path="/lien-he" element={<Contact />} />

            {/* Trang thông báo */}
            <Route path="/thong-bao" element={<Notifications />} />

            {/* Trang bảng khen thưởng */}
            <Route path="/khen-thuong" element={<TopPostersPage />} />
          </Route>

          {/* Redirect mọi route không xác định về trang chủ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminGuard>
    </BrowserRouter>
  );
}

export default App;
