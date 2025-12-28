import AppSidebar from './AppSidebar'
import { Outlet } from 'react-router-dom'

export default function LayoutAdmin() {
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
            <AppSidebar />
            <div className="flex-1 flex flex-col overflow-auto">
                <main className="flex-1">
                    <div className="p-6 lg:p-8">
                        <Outlet />
                    </div>
                </main>
                {/* Footer Admin */}
                <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm py-4 px-6">
                    <div className="text-center text-sm text-gray-500">
                        © {new Date().getFullYear()} <span className="font-semibold text-gray-700">QLVTK-ĐTL</span> - Đại học Trà Vinh
                    </div>
                </footer>
            </div>
        </div>
    )
}
