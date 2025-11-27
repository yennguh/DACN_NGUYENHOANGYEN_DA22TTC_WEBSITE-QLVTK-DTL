import React from 'react';
import AdminSection from './components/AdminSection';

export default function LostItemCreate() {
    return (
        <AdminSection
            title="Thêm đồ thất lạc"
            description="Ghi nhận thông tin đồ thất lạc mới tại văn phòng."
        >
            <div className="rounded-lg bg-white p-6 shadow">
                <p className="text-gray-600">Biểu mẫu đang được hoàn thiện.</p>
            </div>
        </AdminSection>
    );
}

