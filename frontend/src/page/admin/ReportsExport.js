import React from 'react';
import AdminSection from './components/AdminSection';

export default function ReportsExport() {
    return (
        <AdminSection
            title="Xuất báo cáo"
            description="Kết xuất dữ liệu theo định dạng PDF hoặc Excel."
        >
            <div className="rounded-lg bg-white p-6 shadow">
                <p className="text-gray-600">Chức năng xuất báo cáo đang được phát triển.</p>
            </div>
        </AdminSection>
    );
}

