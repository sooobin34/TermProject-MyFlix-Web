/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface AuthContextValue {
    isLoggedIn: boolean;
    userEmail: string | null;
    login: (email: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getInitialAuthState() {
    if (typeof window === "undefined") {
        return { isLoggedIn: false, userEmail: null as string | null };
    }

    const storedLogin = localStorage.getItem("isLoggedIn");
    const storedEmail = localStorage.getItem("currentUser");

    if (storedLogin === "true" && storedEmail) {
        return { isLoggedIn: true, userEmail: storedEmail };
    }

    return { isLoggedIn: false, userEmail: null as string | null };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const initial = getInitialAuthState();

    const [isLoggedIn, setIsLoggedIn] = useState(initial.isLoggedIn);
    const [userEmail, setUserEmail] = useState<string | null>(initial.userEmail);

    const login = (email: string) => {
        setIsLoggedIn(true);
        setUserEmail(email);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUser", email);
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUserEmail(null);
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("currentUser");
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, userEmail, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    // userId = 이메일 그대로 사용 (Home / Profile 등에서 사용)
    const userId = ctx.userEmail;

    return {
        ...ctx,
        userId,
    };
};
