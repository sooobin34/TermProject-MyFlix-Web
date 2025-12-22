// src/pages/Home/HomePage.tsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import type { Movie } from "../../api/tmdb";
import {
    fetchNowPlaying,
    fetchPopular,
    fetchTopRated,
    fetchTrending,
} from "../../api/tmdb";
import { MovieRow } from "../../components/movies/MovieRow";
import { useWishlist } from "../../hooks/useWishlist";
import { FeaturedSlider } from "./FeaturedSlider";
import { useProfile } from "../../hooks/useProfile";
import "../../components/movies/movies.css";

const CONTINUE_PREFIX = "myflix_continue_watching";

function getContinueKey(profileId: string | null | undefined) {
    return profileId ? `${CONTINUE_PREFIX}_${profileId}` : CONTINUE_PREFIX;
}

export const HomePage = () => {
    const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
    const [popular, setPopular] = useState<Movie[]>([]);
    const [topRated, setTopRated] = useState<Movie[]>([]);
    const [trending, setTrending] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [continueIds, setContinueIds] = useState<number[]>([]);

    const { toggleWishlist, isInWishlist } = useWishlist();
    const { activeProfile } = useProfile();

    // === ⬇⬇⬇ 여기 핵심 수정: id만 따로 추출해서 dependency로 사용
    const profileId = activeProfile?.id;

    /* 1) 영화 데이터 로딩 */
    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setErrorMsg(null);

                const [now, pop, top, trend] = await Promise.all([
                    fetchNowPlaying(),
                    fetchPopular(),
                    fetchTopRated(),
                    fetchTrending(),
                ]);

                if (!cancelled) {
                    setNowPlaying(now);
                    setPopular(pop);
                    setTopRated(top);
                    setTrending(trend);
                }
            } catch {
                if (!cancelled) {
                    setErrorMsg("영화 데이터를 불러오지 못했습니다. TMDB API 키를 확인해주세요.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, []);


    /* 2) 프로필 별 시청 기록 로딩 — ESLint 오류 해결됨 */
    useEffect(() => {
        if (!profileId) {
            setContinueIds([]);
            return;
        }

        try {
            const key = getContinueKey(profileId);
            const raw = localStorage.getItem(key);

            if (!raw) {
                setContinueIds([]);
                return;
            }

            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                setContinueIds(parsed.filter((id) => typeof id === "number"));
            }
        } catch {
            setContinueIds([]);
        }
    }, [profileId]); // ⬅ ESLint가 요구하는 안정적인 dependency


    /* 프로필 없으면 프로필 선택 페이지로 이동 */
    if (!activeProfile) {
        return <Navigate to="/profiles" replace />;
    }

    const allMovies: Movie[] = [
        ...nowPlaying,
        ...popular,
        ...topRated,
        ...trending,
    ];

    const continueWatching = allMovies.filter((m) =>
        continueIds.includes(m.id)
    );

    return (
        <div className="home-container page-fade">
            {errorMsg && <div className="error-banner">{errorMsg}</div>}

            <FeaturedSlider />

            {/* 시청 중 콘텐츠 */}
            {continueWatching.length > 0 ? (
                <MovieRow
                    title={`${activeProfile.name} 님이 시청 중인 콘텐츠`}
                    movies={continueWatching}
                    isLoading={false}
                    isInWishlist={isInWishlist}
                    onToggleWishlist={toggleWishlist}
                />
            ) : (
                <section className="home-continue-empty-wrap">
                    <h2 className="home-section-title">
                        {activeProfile.name} 님이 시청 중인 콘텐츠
                    </h2>
                    <div className="home-continue-empty-box wishlist-empty">
                        <p>시청 중인 영화가 없습니다.</p>
                        <p className="home-continue-empty-sub">
                            Home / Popular / Search 페이지에서 영화를 재생해보세요.
                        </p>
                    </div>
                </section>
            )}

            <MovieRow
                title="현재 상영작"
                movies={nowPlaying}
                isLoading={loading && nowPlaying.length === 0}
                isInWishlist={isInWishlist}
                onToggleWishlist={toggleWishlist}
            />

            <MovieRow
                title="인기 영화"
                movies={popular}
                isLoading={loading && popular.length === 0}
                isInWishlist={isInWishlist}
                onToggleWishlist={toggleWishlist}
            />

            <MovieRow
                title="최고 평점"
                movies={topRated}
                isLoading={loading && topRated.length === 0}
                isInWishlist={isInWishlist}
                onToggleWishlist={toggleWishlist}
            />

            <MovieRow
                title="트렌딩"
                movies={trending}
                isLoading={loading && trending.length === 0}
                isInWishlist={isInWishlist}
                onToggleWishlist={toggleWishlist}
            />
        </div>
    );
};
