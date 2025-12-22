/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { useProfile } from "./useProfile";

const STORAGE_PREFIX = "myflix_watch_history";

export function useWatchHistory() {
    const { activeProfile } = useProfile();

    const storageKey = activeProfile
        ? `${STORAGE_PREFIX}_${activeProfile.id}`
        : null;

    const [watchIds, setWatchIds] = useState<number[]>([]);

    /* ✅ 프로필 변경 시 로딩 */
    useEffect(() => {
        if (!storageKey) {
            setWatchIds([]);
            return;
        }

        try {
            const raw = localStorage.getItem(storageKey);
            const parsed = raw ? JSON.parse(raw) : [];
            setWatchIds(Array.isArray(parsed) ? parsed : []);
        } catch {
            setWatchIds([]);
        }
    }, [storageKey]);

    /* ✅ 변경 시 저장 */
    useEffect(() => {
        if (!storageKey) return;
        localStorage.setItem(storageKey, JSON.stringify(watchIds));
    }, [watchIds, storageKey]);

    const addWatch = (movieId: number) => {
        setWatchIds((prev) =>
            prev.includes(movieId) ? prev : [...prev, movieId]
        );
    };

    const removeWatch = (movieId: number) => {
        setWatchIds((prev) => prev.filter((id) => id !== movieId));
    };

    const clearWatchHistory = () => {
        setWatchIds([]);
    };

    return {
        watchIds,
        addWatch,
        removeWatch,
        clearWatchHistory,
    };
}
