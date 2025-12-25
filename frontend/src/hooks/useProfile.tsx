/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */

import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { useAuth } from "./useAuth";

export interface Profile {
    id: string;
    name: string;
    color: string;
    icon: string;
}

interface ProfileContextValue {
    profiles: Profile[];
    activeProfile: Profile | null;
    setActiveProfile: (id: string) => void;
    addProfile: (name: string, color: string, icon: string) => boolean;
    updateProfile: (
        id: string,
        patch: Partial<Pick<Profile, "name" | "color" | "icon">>
    ) => void;
    deleteProfile: (id: string) => void;
    isProfileLimitReached: boolean;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(
    undefined
);

const MAX_PROFILES = 2;

const DEFAULT_PROFILE: Profile = {
    id: "p_default",
    name: "기본 프로필",
    color: "#e50914",
    icon: "😀",
};

function base64EncodeUnicode(str: string): string {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary);
}

// ✅ 로컬 로그인용 키 만들기 (email 같은 문자열을 안전하게 키로)
function makeLocalUserKey(email: string) {
    return `local_${base64EncodeUnicode(email)}`;
}

function loadProfiles(userKey: string | null): {
    profiles: Profile[];
    activeId: string | null;
} {
    if (!userKey) {
        return { profiles: [], activeId: null };
    }

    const profileKey = `myflix_profiles_${userKey}`;
    const activeKey = `myflix_active_profile_${userKey}`;

    try {
        const stored = localStorage.getItem(profileKey);
        const parsed: Profile[] = stored ? JSON.parse(stored) : [];

        const profiles =
            Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_PROFILE];

        // 프로필 목록 동기화(기본 프로필 자동 생성 포함)
        localStorage.setItem(profileKey, JSON.stringify(profiles));

        const storedActive = localStorage.getItem(activeKey);
        const activeId =
            profiles.find((p) => p.id === storedActive)?.id ?? profiles[0]?.id ?? null;

        if (activeId) localStorage.setItem(activeKey, activeId);
        else localStorage.removeItem(activeKey);

        return { profiles, activeId };
    } catch (err) {
        console.error("[profile] loadProfiles error:", err);
        return { profiles: [DEFAULT_PROFILE], activeId: DEFAULT_PROFILE.id };
    }
}

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
    const { userId, userEmail } = useAuth();

    // ✅ 핵심: userKey는 항상 존재하도록 만들기
    // 1) Google 로그인: uid(userId)
    // 2) 로컬 로그인: email 기반 localKey
    const userKey = useMemo(() => {
        if (userId) return userId; // uid
        if (userEmail) return makeLocalUserKey(userEmail);
        return null;
    }, [userId, userEmail]);

    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

    // ✅ userKey가 바뀔 때마다 로딩
    useEffect(() => {
        const { profiles: loaded, activeId } = loadProfiles(userKey);
        setProfiles(loaded);
        setActiveProfileId(activeId);
    }, [userKey]);

    const persistProfiles = (next: Profile[]) => {
        if (!userKey) return;
        localStorage.setItem(`myflix_profiles_${userKey}`, JSON.stringify(next));
    };

    const setActiveProfile = (id: string) => {
        if (!userKey) return;
        setActiveProfileId(id);
        localStorage.setItem(`myflix_active_profile_${userKey}`, id);
    };

    const addProfile = (name: string, color: string, icon: string): boolean => {
        if (!userKey) return false;
        if (profiles.length >= MAX_PROFILES) return false;

        const newProfile: Profile = {
            id: `p_${Date.now()}`,
            name,
            color,
            icon,
        };

        const next = [...profiles, newProfile];
        setProfiles(next);
        persistProfiles(next);
        return true;
    };

    const updateProfile = (
        id: string,
        patch: Partial<Pick<Profile, "name" | "color" | "icon">>
    ) => {
        const next = profiles.map((p) => (p.id === id ? { ...p, ...patch } : p));
        setProfiles(next);
        persistProfiles(next);
    };

    const deleteProfile = (id: string) => {
        if (!userKey) return;

        const next = profiles.filter((p) => p.id !== id);
        setProfiles(next);
        persistProfiles(next);

        if (activeProfileId === id) {
            const fallback = next[0]?.id ?? null;
            setActiveProfileId(fallback);

            if (fallback) {
                localStorage.setItem(`myflix_active_profile_${userKey}`, fallback);
            } else {
                localStorage.removeItem(`myflix_active_profile_${userKey}`);
            }
        }
    };

    const activeProfile =
        profiles.find((p) => p.id === activeProfileId) ?? null;

    return (
        <ProfileContext.Provider
            value={{
                profiles,
                activeProfile,
                setActiveProfile,
                addProfile,
                updateProfile,
                deleteProfile,
                isProfileLimitReached: profiles.length >= MAX_PROFILES,
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const ctx = useContext(ProfileContext);
    if (!ctx) {
        throw new Error("useProfile must be used within ProfileProvider");
    }
    return ctx;
};
