import React from 'react';
import AdminSection from './components/AdminSection';

export default function SettingsCategories() {
    return (
        <AdminSection
            title="Danh mục"
            description="Quản lý các nhóm vật dụng để phân loại nhanh chóng."
        >
            <div className="rounded-lg bg-white p-6 shadow">
                <p className="text-gray-600">Danh mục sẽ được cấu hình tại đây.</p>
            </div>
        </AdminSection>
    );
}

