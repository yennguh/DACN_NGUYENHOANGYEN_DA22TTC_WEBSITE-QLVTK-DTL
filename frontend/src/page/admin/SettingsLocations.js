import React from 'react';
import AdminSection from './components/AdminSection';

export default function SettingsLocations() {
    return (
        <AdminSection
            title="Vị trí"
            description="Thiết lập các khu vực tiếp nhận và trả đồ trong khuôn viên."
        >
            <div className="rounded-lg bg-white p-6 shadow">
                <p className="text-gray-600">Danh sách vị trí sẽ được bổ sung.</p>
            </div>
        </AdminSection>
    );
}

