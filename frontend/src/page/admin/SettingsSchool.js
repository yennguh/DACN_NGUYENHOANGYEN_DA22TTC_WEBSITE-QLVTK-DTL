import React from 'react';
import AdminSection from './components/AdminSection';

export default function SettingsSchool() {
    return (
        <AdminSection
            title="Thông tin trường"
            description="Cập nhật thông tin liên hệ, logo và chính sách của nhà trường."
        >
            <div className="rounded-lg bg-white p-6 shadow">
                <p className="text-gray-600">Trang cấu hình đang chờ dữ liệu.</p>
            </div>
        </AdminSection>
    );
}

