import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import NetworkStatus from './components/NetworkStatus';
import HomePage from './page/home/HomePage';
import LostItemsPage from './page/home/LostItemsPage';
import LoginPage from './page/auth/LoginPage';
import RegisterPage from './page/auth/RegisterPage';
import AdminLogin from './page/admin/AdminLogin';
import MainLayout from './layout/Mainlayout';
import Dashboard from './page/admin/Dashboard';
import LayoutAdmin from './layout/LayoutAdmin';
import ProtectedRoute from './routes/ProtectedRoute';
import Roles from './page/admin/Roles';
import LostItemsList from './page/admin/LostItemsList';
import LostItemCreate from './page/admin/LostItemCreate';
import SettingsSchool from './page/admin/SettingsSchool';
import SettingsCategories from './page/admin/SettingsCategories';
import SettingsLocations from './page/admin/SettingsLocations';
import AdminProfile from './page/admin/AdminProfile';
import AdminPassword from './page/admin/AdminPassword';
import ContactMessages from './page/admin/ContactMessages';
import ReportsList from './page/admin/ReportsList';
import AdminPostEdit from './page/admin/AdminPostEdit';
import ReturnedItemsList from './page/admin/ReturnedItemsList';
import BaidangDetail from './page/baidang/BaidangDetail';
import BaidangCreate from './page/baidang/BaidangCreate';
import MyPosts from './page/baidang/MyPosts';
import Profile from './page/profile/Profile';
import Contact from './page/contact/Contact';
import Notifications from './page/notifications/Notifications';
import TopPostersPage from './page/topPosters/TopPostersPage';

function App() {
  return (
    <BrowserRouter>
      <NetworkStatus />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Routes – bảo vệ bằng ProtectedRoute + LayoutAdmin */}
        <Route element={<ProtectedRoute />}>
          <Route element={<LayoutAdmin />} allowedRoles={["admin"]}>
            <Route path="/admin" element={<Dashboard />} />
            {/* Bài đăng */}
            <Route path="/admin/lost-items" element={<LostItemsList />} />
            <Route path="/admin/returned-items" element={<ReturnedItemsList />} />
            <Route path="/admin/admin-posts/create" element={<LostItemCreate />} />
            <Route path="/admin/posts/:id" element={<BaidangDetail />} />
            <Route path="/admin/posts/:id/edit" element={<AdminPostEdit />} />
            <Route path="/admin/roles" element={<Roles />} />
            <Route path="/admin/settings/school" element={<SettingsSchool />} />
            <Route path="/admin/settings/categories" element={<SettingsCategories />} />
            <Route path="/admin/settings/locations" element={<SettingsLocations />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/profile/password" element={<AdminPassword />} />
            <Route path="/admin/contacts" element={<ContactMessages />} />
            <Route path="/admin/reports" element={<ReportsList />} />
          </Route>
        </Route>

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
    </BrowserRouter>
  );
}

export default App;
