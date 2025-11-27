import React from 'react';
import AdminSection from './components/AdminSection';

export default function LostItemSearch() {
    return (
        <AdminSection
            title="Tìm kiếm nâng cao"
            description="Lọc nhanh đồ thất lạc theo ngày, địa điểm, tình trạng."
        >
            <div className="rounded-lg bg-white p-6 shadow">
                <p className="text-gray-600">Bộ lọc đang được xây dựng.</p>
            </div>
        </AdminSection>
    );
}

