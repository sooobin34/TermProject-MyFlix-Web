/* eslint-disable react-hooks/set-state-in-effect */

// src/hooks/useWishlist.ts
import { useEffect, useMemo, useState } from "react";
import type { Movie } from "../api/tmdb";
import { useProfile } from "./useProfile";
import { useAuth } from "./useAuth";

// ✅ Firebase
import { db } from "../firebase/firebase";
import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    serverTimestamp,
    setDoc,
    query,
    orderBy,
} from "firebase/firestore";

export type WishlistMovie = Pick<
    Movie,
    "id" | "title" | "poster_path" | "vote_average" | "release_date" | "overview"
>;

const BASE_KEY = "myflix_wishlist";

function toCompact(movie: Movie | WishlistMovie): WishlistMovie {
    return {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
        overview: movie.overview,
    };
}

export function useWishlist() {
    const { activeProfile } = useProfile();
    const { userId } = useAuth(); // ✅ uid

    // 프로필별 key (프로필 없으면 null)
    const storageKey = activeProfile ? `${BASE_KEY}_${activeProfile.id}` : null;

    // ✅ Firestore는 uid + activeProfile 있어야 사용
    const useFirestore = Boolean(userId && activeProfile?.id);

    // ✅ 지금 어떤 모드로 도는지 콘솔에 찍기 (원인 파악용)
    useEffect(() => {
        console.log("[wishlist] mode:", useFirestore ? "firestore" : "local", {
            userId,
            profileId: activeProfile?.id,
            storageKey,
        });
    }, [useFirestore, userId, activeProfile?.id, storageKey]);

    const [wishlist, setWishlist] = useState<WishlistMovie[]>(() => {
        if (typeof window === "undefined") return [];
        if (useFirestore) return []; // Firestore는 snapshot이 채움

        if (!storageKey) return [];
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? (parsed as WishlistMovie[]) : [];
        } catch (err) {
            console.error("[wishlist] localStorage parse error:", err);
            return [];
        }
    });

    // --- Firestore 컬렉션 레퍼런스 ---
    const wishlistColRef = useMemo(() => {
        if (!userId || !activeProfile?.id) return null;
        return collection(
            db,
            "users",
            userId,
            "profiles",
            String(activeProfile.id),
            "wishlist"
        );
    }, [userId, activeProfile?.id]);

    // ✅ Firestore 모드: 실시간 동기화
    useEffect(() => {
        if (!useFirestore || !wishlistColRef) return;

        const q = query(wishlistColRef, orderBy("createdAt", "desc"));
        const unsub = onSnapshot(
            q,
            (snap) => {
                const items: WishlistMovie[] = snap.docs.map((d) => {
                    const data = d.data() as WishlistMovie & { createdAt?: unknown };
                    return {
                        id: data.id,
                        title: data.title,
                        poster_path: data.poster_path,
                        vote_average: data.vote_average,
                        release_date: data.release_date,
                        overview: data.overview,
                    };
                });
                setWishlist(items);
            },
            (err) => {
                // ✅ 여기 중요: rules/권한 문제면 여기로 떨어짐
                console.error("[wishlist] onSnapshot error:", err);
                setWishlist([]);
            }
        );

        return () => unsub();
    }, [useFirestore, wishlistColRef]);

    // ✅ LocalStorage 모드: 프로필 바뀔 때마다 다시 로딩
    useEffect(() => {
        if (useFirestore) return;

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
        } catch (err) {
            console.error("[wishlist] localStorage load error:", err);
            setWishlist([]);
        }
    }, [storageKey, useFirestore]);

    // ✅ LocalStorage 모드: 변경될 때마다 저장
    useEffect(() => {
        if (useFirestore) return;
        if (!storageKey) return;

        try {
            localStorage.setItem(storageKey, JSON.stringify(wishlist));
        } catch (err) {
            console.error("[wishlist] localStorage save error:", err);
        }
    }, [wishlist, storageKey, useFirestore]);

    const isInWishlist = (id: number) => wishlist.some((m) => m.id === id);

    const toggleWishlist = async (movie: Movie | WishlistMovie) => {
        // ✅ Firestore 모드
        if (useFirestore && wishlistColRef && userId && activeProfile?.id) {
            const compact = toCompact(movie);

            const movieDocRef = doc(
                db,
                "users",
                userId,
                "profiles",
                String(activeProfile.id),
                "wishlist",
                String(compact.id)
            );

            const exists = wishlist.some((m) => m.id === compact.id);

            try {
                if (exists) {
                    await deleteDoc(movieDocRef);
                } else {
                    await setDoc(movieDocRef, {
                        ...compact,
                        createdAt: serverTimestamp(),
                    });
                }
            } catch (err) {
                // ✅ 여기 중요: permission-denied 등이 여기 찍힘
                console.error("[wishlist] toggle failed:", err, {
                    userId,
                    profileId: activeProfile.id,
                    movieId: compact.id,
                });
            }
            return;
        }

        // ✅ LocalStorage fallback 모드
        setWishlist((prev) => {
            const exists = prev.some((m) => m.id === movie.id);
            if (exists) return prev.filter((m) => m.id !== movie.id);
            return [...prev, toCompact(movie)];
        });
    };

    return {
        wishlist,
        toggleWishlist,
        isInWishlist,
        source: useFirestore ? "firestore" : "local",
    };
}
