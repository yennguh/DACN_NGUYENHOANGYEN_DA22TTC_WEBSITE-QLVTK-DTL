import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const MainLayout = () => {
    return (
        <div className="site">
            <Header />

            <div className="site-body" style={{ display: 'flex', gap: 24 }}>
                {/* Sidebar */}

                {/* Main content area */}
                <main className="site-content" style={{ flex: 1 }}>
                    <Outlet />
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default MainLayout;
