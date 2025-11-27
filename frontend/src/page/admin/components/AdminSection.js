import React from 'react';

export default function AdminSection({ title, description, children }) {
    return (
        <section className="p-6 space-y-4">
            <header>
                <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
                {description && <p className="mt-1 text-gray-600">{description}</p>}
            </header>

            {children ? (
                children
            ) : (
                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-gray-500">
                    Đang cập nhật nội dung cho khu vực quản trị này.
                </div>
            )}
        </section>
    );
}

