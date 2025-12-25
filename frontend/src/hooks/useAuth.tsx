/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { logoutAll } from "../auth/authService";

interface AuthContextValue {
    isLoggedIn: boolean;
    userEmail: string | null; // 표시용
    userId: string | null; // ✅ Firestore용 uid
    login: (uid: string | null, email: string | null) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getInitialAuthState() {
    if (typeof window === "undefined") {
        return {
            isLoggedIn: false,
            userEmail: null as string | null,
            userId: null as string | null,
        };
    }

    const storedLogin = localStorage.getItem("isLoggedIn");
    const storedEmail = localStorage.getItem("currentUser");
    const storedUid = localStorage.getItem("uid");

    if (storedLogin === "true") {
        return {
            isLoggedIn: true,
            userEmail: storedEmail ?? null,
            userId: storedUid ?? null,
        };
    }

    return {
        isLoggedIn: false,
        userEmail: null as string | null,
        userId: null as string | null,
    };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const initial = getInitialAuthState();

    const [isLoggedIn, setIsLoggedIn] = useState(initial.isLoggedIn);
    const [userEmail, setUserEmail] = useState<string | null>(initial.userEmail);
    const [userId, setUserId] = useState<string | null>(initial.userId);

    /**
     * ✅ login은 uid/email 둘 다 받을 수 있게
     * - Google 로그인: uid 필수
     * - 로컬 로그인(과제2 방식): uid가 없으니 null로 들어올 수 있음 (Firestore는 이 경우 LocalStorage fallback)
     */
    const login = (uid: string | null, email: string | null) => {
        setIsLoggedIn(true);
        setUserId(uid);
        setUserEmail(email);

        localStorage.setItem("isLoggedIn", "true");

        if (uid) localStorage.setItem("uid", uid);
        else localStorage.removeItem("uid");

        if (email) localStorage.setItem("currentUser", email);
        else localStorage.removeItem("currentUser");
    };

    const logout = async () => {
        await logoutAll();
        setIsLoggedIn(false);
        setUserEmail(null);
        setUserId(null);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, userEmail, userId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return ctx;
};
