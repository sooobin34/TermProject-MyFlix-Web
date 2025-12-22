/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */

import {
    createContext,
    useContext,
    useEffect,
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

function loadProfiles(userId: string | null): {
    profiles: Profile[];
    activeId: string | null;
} {
    if (!userId) {
        return { profiles: [], activeId: null };
    }

    const profileKey = `myflix_profiles_${userId}`;
    const activeKey = `myflix_active_profile_${userId}`;

    try {
        const stored = localStorage.getItem(profileKey);
        const parsed: Profile[] = stored ? JSON.parse(stored) : [];

        const profiles =
            Array.isArray(parsed) && parsed.length > 0
                ? parsed
                : [
                    {
                        id: "default",
                        name: "기본 프로필",
                        color: "#e50914",
                        icon: "😀",
                    },
                ];

        // 프로필 목록 동기화
        localStorage.setItem(profileKey, JSON.stringify(profiles));

        const storedActive = localStorage.getItem(activeKey);
        const activeId =
            profiles.find((p) => p.id === storedActive)?.id ??
            profiles[0]?.id ??
            null;

        if (activeId) {
            localStorage.setItem(activeKey, activeId);
        } else {
            localStorage.removeItem(activeKey);
        }

        return { profiles, activeId };
    } catch {
        return { profiles: [], activeId: null };
    }
}

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
    const { userId } = useAuth();

    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

    // ✅ userId가 바뀔 때마다 한 번만 프로필 로딩
    useEffect(() => {
        const { profiles: loaded, activeId } = loadProfiles(userId ?? null);
        setProfiles(loaded);
        setActiveProfileId(activeId);
    }, [userId]);

    const persistProfiles = (next: Profile[]) => {
        if (!userId) return;
        localStorage.setItem(
            `myflix_profiles_${userId}`,
            JSON.stringify(next)
        );
    };

    const setActiveProfile = (id: string) => {
        if (!userId) return;
        setActiveProfileId(id);
        localStorage.setItem(`myflix_active_profile_${userId}`, id);
    };

    const addProfile = (
        name: string,
        color: string,
        icon: string
    ): boolean => {
        if (!userId) return false;
        if (profiles.length >= MAX_PROFILES) {
            return false;
        }

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
        const next = profiles.map((p) =>
            p.id === id ? { ...p, ...patch } : p
        );
        setProfiles(next);
        persistProfiles(next);
    };

    const deleteProfile = (id: string) => {
        if (!userId) return;

        const next = profiles.filter((p) => p.id !== id);
        setProfiles(next);
        persistProfiles(next);

        if (activeProfileId === id) {
            const fallback = next[0]?.id ?? null;
            setActiveProfileId(fallback);
            if (fallback) {
                localStorage.setItem(
                    `myflix_active_profile_${userId}`,
                    fallback
                );
            } else {
                localStorage.removeItem(
                    `myflix_active_profile_${userId}`
                );
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
