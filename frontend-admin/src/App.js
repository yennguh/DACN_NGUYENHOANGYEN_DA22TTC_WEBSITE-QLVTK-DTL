import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import NetworkStatus from './components/NetworkStatus';
import AdminLogin from './page/admin/AdminLogin';
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

function App() {
  return (
    <BrowserRouter>
      <NetworkStatus />
      <Routes>
        {/* Admin Login */}
        <Route path="/login" element={<AdminLogin />} />

        {/* Admin Routes với LayoutAdmin */}
        <Route element={<ProtectedRoute />}>
          <Route element={<LayoutAdmin />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/admin" element={<Dashboard />} />
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

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
