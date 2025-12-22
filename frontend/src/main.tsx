// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { AppRouter } from "./router/AppRouter";
import { AuthProvider } from "./hooks/useAuth";
import { ProfileProvider } from "./hooks/useProfile";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <AuthProvider>
            <ProfileProvider>
                <AppRouter />
            </ProfileProvider>
        </AuthProvider>
    </React.StrictMode>
);
