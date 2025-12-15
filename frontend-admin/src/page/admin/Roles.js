import React, { useState, useMemo, useEffect } from 'react';
import { Trash2, Edit, Search, Users } from 'lucide-react';
import { fetchAllUsers, deleteUser } from '../../api/users.api';
import { getImageUrl } from '../../utils/constant';
// PermissionManager.js
// React component: Permission management UI (User list + assign permissions)
// Using plain JavaScript + TailwindCSS only.

const AVAILABLE_PERMISSIONS = [
    { id: 'view_users', name: 'Xem người dùng' },
    { id: 'edit_users', name: 'Sửa người dùng' },
    { id: 'delete_users', name: 'Xóa người dùng' },
    { id: 'manage_roles', name: 'Quản lý vai trò' },
    { id: 'view_reports', name: 'Xem báo cáo' },
];
export default function Roles() {
    const [query, setQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [currentPermissions, setCurrentPermissions] = useState(new Set());
    const [currentRole, setCurrentRole] = useState('');
    const [listUser, setListUser] = useState([]);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const fetchAll = async () => {
        try {
            const result = await fetchAllUsers({ page: 1, limit: 100 });

            if (result && result.data) {
                setListUser(result.data);
            } else {
                setListUser([]);
            }
        } catch (error) {
            setListUser([]);
        }
    };
    useEffect(() => {
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    const filteredUsers = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return listUser;
        return listUser.filter(
            (u) =>
                (u.fullname || '').toLowerCase().includes(q) ||
                (u.email || '').toLowerCase().includes(q) ||
                (u.roles || []).some(role => role.toLowerCase().includes(q))
        );
    }, [listUser, query]);

    function openEditor(user) {
        setSelectedUser(user);
        setCurrentPermissions(new Set(user.permissions));
        setCurrentRole(user.role || '');
        setIsDrawerOpen(true);
    }

    function closeEditor() {
        setSelectedUser(null);
        setIsDrawerOpen(false);
    }

    function togglePermission(pid) {
        setCurrentPermissions((prev) => {
            const n = new Set(prev);
            if (n.has(pid)) n.delete(pid);
            else n.add(pid);
            return n;
        });
    }

    function savePermissions() {
        if (!selectedUser) return;
        // TODO: Gọi API để cập nhật phân quyền cho user
        // await updateUserPermissions(selectedUser._id, { permissions: Array.from(currentPermissions), role: currentRole });
        closeEditor();
    }

    const handleDeleteClick = (user) => {
        setDeleteConfirm(user);
    };

    const handleDeleteCancel = () => {
        setDeleteConfirm(null);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm) return;
        
        setIsDeleting(true);
        try {
            await deleteUser(deleteConfirm._id);
            // Refresh danh sách sau khi xóa thành công
            await fetchAll();
            setDeleteConfirm(null);
            alert('Xóa tài khoản thành công!');
        } catch (error) {
            console.error('Lỗi xóa tài khoản:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa tài khoản');
        } finally {
            setIsDeleting(false);
        }
    };


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                            <Users className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Quản lý phân quyền</h1>
                            <p className="text-indigo-100 mt-1">Danh sách người dùng & phân quyền</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold">{listUser.length}</p>
                        <p className="text-indigo-100 text-sm">người dùng</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="flex-1 relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Tìm tên, email hoặc vai trò..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full table-auto">
                    <thead className="bg-gray-50/80">
                        <tr>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase py-4 px-4">Người dùng</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase py-4 px-4">Email</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase py-4 px-4">Quyền</th>
                            <th className="text-right text-xs font-semibold text-gray-500 uppercase py-4 px-4">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers && filteredUsers.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-white shadow-sm">
                                            {user.avatar ? (
                                                <img src={getImageUrl(user.avatar)} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-white text-sm font-bold">{(user.fullname || 'U').charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{user.fullname}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-sm text-gray-600">{user.email}</td>
                                <td className="py-4 px-4">
                                    <div className="flex flex-wrap gap-2">
                                        {!user.roles || user.roles.length === 0 ? (
                                            <span className="text-gray-400 text-sm">Chưa có quyền</span>
                                        ) : (
                                            user.roles.map((role) => (
                                                role && (
                                                    <span
                                                        key={role}
                                                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                                                            role === 'admin' 
                                                                ? 'bg-red-100 text-red-700' 
                                                                : 'bg-green-100 text-green-700'
                                                        }`}
                                                    >
                                                        {role}
                                                    </span>
                                                )
                                            ))
                                        )}
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <div className="inline-flex gap-1">
                                        <button
                                            onClick={() => openEditor(user)}
                                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Chỉnh sửa phân quyền"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(user)}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Xóa tài khoản"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers && filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                    Không có người dùng nào khớp
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Drawer / Editor */}
            <div
                className={`fixed inset-0 z-40 ${isDrawerOpen ? '' : 'pointer-events-none'}`}
                aria-hidden={!isDrawerOpen}
            >
                <div
                    className={`absolute inset-0 bg-black transition-opacity ${isDrawerOpen ? 'opacity-40' : 'opacity-0'
                        }`}
                    onClick={closeEditor}
                ></div>
                <aside
                    className={`absolute right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl transform transition-transform ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}
                >
                    <div className="p-4 flex items-center justify-between border-b">
                        <h2 className="text-lg font-semibold">
                            {selectedUser ? `Phân quyền: ${selectedUser.name}` : 'Phân quyền'}
                        </h2>
                        <button onClick={closeEditor} className="px-3 py-1">
                            Đóng
                        </button>
                    </div>

                    <div className="p-4 space-y-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Vai trò</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={currentRole}
                                onChange={(e) => setCurrentRole(e.target.value)}
                            >
                                <option value="Admin">Admin</option>
                                <option value="Editor">Editor</option>
                                <option value="Viewer">Viewer</option>
                                <option value="Analyst">Analyst</option>
                                <option value="">(Không đặt vai trò)</option>
                            </select>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Quyền</label>
                                <div className="text-xs text-gray-500">
                                    {currentPermissions.size} đã chọn
                                </div>
                            </div>

                            <div className="mt-2 grid grid-cols-1 gap-2">
                                {AVAILABLE_PERMISSIONS.map((p) => (
                                    <label
                                        key={p.id}
                                        className="flex items-center gap-2 p-2 border rounded"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={currentPermissions.has(p.id)}
                                            onChange={() => togglePermission(p.id)}
                                        />
                                        <div>
                                            <div className="text-sm font-medium">{p.name}</div>
                                            {p.description && (
                                                <div className="text-xs text-gray-500">{p.description}</div>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={savePermissions}
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                Lưu
                            </button>
                            <button onClick={closeEditor} className="px-4 py-2 border rounded">
                                Hủy
                            </button>
                        </div>

                        <div className="text-xs text-gray-400">
                            Ghi chú: Đây là UI mẫu. Thay thế logic lưu bằng API gọi backend để lưu dữ liệu.
                        </div>
                    </div>
                </aside>
            </div>

            {/* Delete Confirmation Dialog */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black opacity-40" onClick={handleDeleteCancel}></div>
                    <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Xác nhận xóa tài khoản</h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn xóa tài khoản <strong>{deleteConfirm.fullname}</strong> ({deleteConfirm.email})?
                            <br />
                            <span className="text-red-600 text-sm mt-2 block">Hành động này không thể hoàn tác!</span>
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleDeleteCancel}
                                disabled={isDeleting}
                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? 'Đang xóa...' : 'Xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}