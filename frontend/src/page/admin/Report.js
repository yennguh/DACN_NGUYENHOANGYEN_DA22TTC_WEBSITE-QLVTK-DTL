import React from 'react';
import AdminSection from './components/AdminSection';

export default function Report() {
    return (
        <AdminSection
            title="Báo cáo tháng"
            description="Tổng hợp nhanh các số liệu trong tháng hiện tại."
        >
            <div className="rounded-lg bg-white p-6 shadow">
                <p className="text-gray-600">Bảng báo cáo tháng đang được hoàn thiện.</p>
            </div>
        </AdminSection>
    );
}
