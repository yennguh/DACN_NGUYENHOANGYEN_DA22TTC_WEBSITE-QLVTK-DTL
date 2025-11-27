import React from 'react'
import AppSidebar from './AppSidebar'
import { Outlet } from 'react-router-dom'

export default function LayoutAdmin() {
    return (
        <div className="flex">
            <AppSidebar />
            <main className="flex-1 ">
                <div>
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
