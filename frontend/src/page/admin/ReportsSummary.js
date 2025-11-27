import React from 'react';
import AdminSection from './components/AdminSection';

export default function ReportsSummary() {
    return (
        <AdminSection
            title="Thống kê tổng hợp"
            description="Tổng hợp hiệu suất thu hồi và bàn giao đồ thất lạc."
        >
            <div className="rounded-lg bg-white p-6 shadow">
                <p className="text-gray-600">Phần tổng hợp sẽ hiển thị tại đây.</p>
            </div>
        </AdminSection>
    );
}

