import React from 'react';
import AdminSection from './components/AdminSection';

export default function AdminPassword() {
    return (
        <AdminSection
            title="Đổi mật khẩu"
            description="Thiết lập lại mật khẩu đăng nhập cho tài khoản quản trị."
        >
            <div className="rounded-lg bg-white p-6 shadow">
                <p className="text-gray-600">Chức năng đổi mật khẩu sẽ được bổ sung.</p>
            </div>
        </AdminSection>
    );
}

