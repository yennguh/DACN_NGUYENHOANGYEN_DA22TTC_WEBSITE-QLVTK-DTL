export default function AdminSection({ title, description, children, action }) {
    return (
        <section className="space-y-6">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                    {description && <p className="mt-1 text-gray-500 text-sm">{description}</p>}
                </div>
                {action && <div>{action}</div>}
            </header>

            {/* Content */}
            {children ? (
                children
            ) : (
                <div className="card">
                    <div className="card-body text-center py-12">
                        <div className="text-gray-400 text-lg">Đang cập nhật nội dung...</div>
                    </div>
                </div>
            )}
        </section>
    );
}

