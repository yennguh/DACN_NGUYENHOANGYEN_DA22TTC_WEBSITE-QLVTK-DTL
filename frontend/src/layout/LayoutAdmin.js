import AppSidebar from './AppSidebar'
import { Outlet } from 'react-router-dom'

export default function LayoutAdmin() {
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <AppSidebar />
            <div className="flex-1 flex flex-col overflow-auto">
                <main className="flex-1">
                    <div className="p-6">
                        <Outlet />
                    </div>
                </main>
                {/* Footer Admin */}
                <footer className="border-t border-gray-200 bg-white py-4 px-6">
                    <div className="text-center text-sm text-gray-500">
                        @anhy
                    </div>
                </footer>
            </div>
        </div>
    )
}
