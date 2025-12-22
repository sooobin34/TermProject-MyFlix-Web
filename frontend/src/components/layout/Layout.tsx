// src/components/layout/Layout.tsx
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";

export const Layout = () => {
    const location = useLocation();

    return (
        <div className="app-root">
            <Header />
            <main className="app-main">
                {/* 페이지 전환 애니메이션용 wrapper */}
                <div key={location.pathname} className="page-container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
