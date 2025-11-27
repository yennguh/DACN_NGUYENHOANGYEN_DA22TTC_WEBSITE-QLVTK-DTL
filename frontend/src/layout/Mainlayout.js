import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Home from "../page/home/Home";

const MainLayout = () => {
    return (
        <div className="site">
            <Header />

            <div className="site-body" style={{ display: 'flex', gap: 24 }}>
                {/* Sidebar */}

                {/* Main content area */}
                <main className="site-content" style={{ flex: 1 }}>
                    {/* keep the Home hero/slider above the routed content */}
                    <Home />
                    <div style={{ marginTop: 16 }}>
                        <Outlet />
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default MainLayout;
