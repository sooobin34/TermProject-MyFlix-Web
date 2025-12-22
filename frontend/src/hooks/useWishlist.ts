// src/hooks/useWishlist.ts
import { useEffect, useState } from "react";
import type { Movie } from "../api/tmdb";
import { useProfile } from "./useProfile";

export type WishlistMovie = Pick<
    Movie,
    "id" | "title" | "poster_path" | "vote_average" | "release_date" | "overview"
>;

const BASE_KEY = "myflix_wishlist";

export function useWishlist() {
    const { activeProfile } = useProfile();

    // 프로필별 key (프로필 없으면 null)
    const storageKey = activeProfile ? `${BASE_KEY}_${activeProfile.id}` : null;

    // ✅ 초기 로딩
    const [wishlist, setWishlist] = useState<WishlistMovie[]>(() => {
        if (typeof window === "undefined" || !storageKey) return [];
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? (parsed as WishlistMovie[]) : [];
        } catch {
            return [];
        }
    });

    // ✅ 프로필이 바뀔 때마다 다시 로딩
    useEffect(() => {
        if (!storageKey) {
            setWishlist([]);
            return;
        }
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) {
                setWishlist([]);
                return;
            }
            const parsed = JSON.parse(raw);
            setWishlist(Array.isArray(parsed) ? (parsed as WishlistMovie[]) : []);
        } catch {
            setWishlist([]);
        }
    }, [storageKey]);

    // ✅ 변경될 때마다 저장
    useEffect(() => {
        if (!storageKey) return;
        try {
            localStorage.setItem(storageKey, JSON.stringify(wishlist));
        } catch {
            // quota 에러 등은 무시
        }
    }, [wishlist, storageKey]);

    const isInWishlist = (id: number) =>
        wishlist.some((m) => m.id === id);

    const toggleWishlist = (movie: Movie | WishlistMovie) => {
        setWishlist((prev) => {
            const exists = prev.some((m) => m.id === movie.id);
            if (exists) {
                // 이미 있으면 제거
                return prev.filter((m) => m.id !== movie.id);
            }

            // 새로 추가
            const compact: WishlistMovie = {
                id: movie.id,
                title: movie.title,
                poster_path: movie.poster_path,
                vote_average: movie.vote_average,
                release_date: movie.release_date,
                overview: movie.overview,
            };
            return [...prev, compact];
        });
    };

    return { wishlist, toggleWishlist, isInWishlist };
}
