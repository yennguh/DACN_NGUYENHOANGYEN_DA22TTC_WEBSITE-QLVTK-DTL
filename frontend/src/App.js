import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Content from './layout/Content';
import LoginPage from './page/auth/LoginPage';
import RegisterPage from './page/auth/RegisterPage';
import MainLayout from './layout/Mainlayout';
import LostItemDetail from './page/lost/LostItemDetail';
import Dashboard from './page/admin/Dashboard';
import LayoutAdmin from './layout/LayoutAdmin';
import Report from './page/admin/Report';
import ProtectedRoute from './routes/ProtectedRoute';
import Roles from './page/admin/Roles';
import LostItemsList from './page/admin/LostItemsList';
import LostItemCreate from './page/admin/LostItemCreate';
import LostItemSearch from './page/admin/LostItemSearch';
import FoundItemsList from './page/admin/FoundItemsList';
import FoundItemsStats from './page/admin/FoundItemsStats';
import ReportsSummary from './page/admin/ReportsSummary';
import ReportsExport from './page/admin/ReportsExport';
import SettingsSchool from './page/admin/SettingsSchool';
import SettingsCategories from './page/admin/SettingsCategories';
import SettingsLocations from './page/admin/SettingsLocations';
import AdminProfile from './page/admin/AdminProfile';
import AdminPassword from './page/admin/AdminPassword';
import ContactMessages from './page/admin/ContactMessages';
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
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin Routes – bảo vệ bằng ProtectedRoute + LayoutAdmin */}
        <Route element={<ProtectedRoute />}>
          <Route element={<LayoutAdmin />} allowedRoles={["admin"]}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/lost-items" element={<LostItemsList />} />
            <Route path="/admin/lost-items/add" element={<LostItemCreate />} />
            <Route path="/admin/lost-items/search" element={<LostItemSearch />} />
            <Route path="/admin/found-items" element={<FoundItemsList />} />
            <Route path="/admin/found-items/stats" element={<FoundItemsStats />} />
            <Route path="/admin/posts/:id" element={<BaidangDetail />} />
            <Route path="/admin/reports" element={<Report />} />
            <Route path="/admin/reports/summary" element={<ReportsSummary />} />
            <Route path="/admin/reports/export" element={<ReportsExport />} />
            <Route path="/admin/roles" element={<Roles />} />
            <Route path="/admin/settings/school" element={<SettingsSchool />} />
            <Route path="/admin/settings/categories" element={<SettingsCategories />} />
            <Route path="/admin/settings/locations" element={<SettingsLocations />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/profile/password" element={<AdminPassword />} />
            <Route path="/admin/contacts" element={<ContactMessages />} />
          </Route>
        </Route>

        {/* Public & User Routes – dùng MainLayout */}
        <Route element={<MainLayout />}>
          {/* Trang chủ */}
          <Route path="/" element={<Content />} />

          {/* Chi tiết đồ thất lạc cũ (giữ lại nếu cần) */}
          <Route path="/detail/:id" element={<LostItemDetail />} />

          {/* ===== TRANG BÀI ĐĂNG MỚI – ĐÃ THÊM ===== */}
          <Route path="/baidang/create" element={<BaidangCreate />} />
          <Route path="/baidang/:id" element={<BaidangDetail />} />
          <Route path="/baidang/mine" element={<MyPosts />} />
          {/* ======================================== */}

          {/* Trang hồ sơ cá nhân */}
          <Route path="/profile" element={<Profile />} />

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