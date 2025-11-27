import React from 'react';
import AdminSection from './components/AdminSection';

export default function FoundItemsStats() {
    return (
        <AdminSection
            title="Thống kê đồ đã trả"
            description="Báo cáo chi tiết về hiệu suất xử lý đồ thất lạc."
        >
            <div className="rounded-lg bg-white p-6 shadow">
                <p className="text-gray-600">Biểu đồ thống kê đang được cập nhật.</p>
            </div>
        </AdminSection>
    );
}

