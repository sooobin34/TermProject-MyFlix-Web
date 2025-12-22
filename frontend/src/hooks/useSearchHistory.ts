/* eslint-disable react-hooks/set-state-in-effect */
// src/hooks/useSearchHistory.ts

import { useEffect, useState } from "react";
import { useProfile } from "./useProfile";

const STORAGE_PREFIX = "myflix_search_history";

export function useSearchHistory() {
    const { activeProfile } = useProfile();

    const storageKey = activeProfile
        ? `${STORAGE_PREFIX}_${activeProfile.id}`
        : null;

    const [keywords, setKeywords] = useState<string[]>([]);

    /* ✅ 프로필 변경 시 검색 기록 로드 */
    useEffect(() => {
        if (!storageKey) {
            setKeywords([]);
            return;
        }

        try {
            const raw = localStorage.getItem(storageKey);
            const parsed = raw ? JSON.parse(raw) : [];
            setKeywords(Array.isArray(parsed) ? parsed : []);
        } catch {
            setKeywords([]);
        }
    }, [storageKey]);

    /* ✅ 변경 시 저장 */
    useEffect(() => {
        if (!storageKey) return;
        localStorage.setItem(storageKey, JSON.stringify(keywords));
    }, [keywords, storageKey]);

    const addKeyword = (keyword: string) => {
        const trimmed = keyword.trim();
        if (!trimmed) return;

        setKeywords((prev) => {
            if (prev.includes(trimmed)) return prev;
            return [trimmed, ...prev].slice(0, 20); // 최근 20개 제한
        });
    };

    const removeKeyword = (keyword: string) => {
        setKeywords((prev) => prev.filter((k) => k !== keyword));
    };

    const clearSearchHistory = () => {
        setKeywords([]);
    };

    return {
        keywords,
        addKeyword,
        removeKeyword,
        clearSearchHistory,
    };
}
