// src/pages/Popular/PopularPage.tsx
import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import type { Movie, Genre } from "../../api/tmdb";
import {
    fetchPopular,
    fetchDiscover,
    fetchGenres,
    TMDB_IMAGE_BASE,
} from "../../api/tmdb";
import "./popular.css";
import { useWishlist } from "../../hooks/useWishlist";
import {
    FaThLarge,
    FaInfinity,
    FaArrowUp,
    FaHeart,
    FaRegHeart,
    FaFire,
    FaStar,
    FaSpinner,
    FaChevronLeft,
    FaChevronRight,
} from "react-icons/fa";

type ViewType = "table" | "infinite";
const MAX_PAGE = 10;

/** TOP 버튼을 body 기준으로 띄우는 포탈 컴포넌트 */
function TopButtonPortal({ onClick }: { onClick: () => void }) {
    if (typeof document === "undefined") return null;

    return createPortal(
        <button
            type="button"
            className="popular-top-btn"
            onClick={onClick}
            aria-label="맨 위로"
        >
            <FaArrowUp />
        </button>,
        document.body
    );
}

export const PopularPage = () => {
    const [view, setView] = useState<ViewType>("table");
    const { toggleWishlist, isInWishlist } = useWishlist();

    /* ===== 장르 상태 ===== */
    const [genres, setGenres] = useState<Genre[]>([]);
    const [selectedGenre, setSelectedGenre] = useState<number | "all">("all");

    /* ===== 에러 / 로딩 ===== */
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    /* ===== Table View 상태 ===== */
    const [tablePage, setTablePage] = useState(1);
    const [tableMovies, setTableMovies] = useState<Movie[]>([]);
    const [tableLoading, setTableLoading] = useState(false);

    /* ===== Infinite View 상태 ===== */
    const [scrollMovies, setScrollMovies] = useState<Movie[]>([]);
    const [scrollPage, setScrollPage] = useState(1);
    const [scrollLoading, setScrollLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    /* IntersectionObserver용 센티널 ref */
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    /* ===== 장르 목록 (마운트 시 1회) ===== */
    useEffect(() => {
        let cancelled = false;

        const loadGenres = async () => {
            try {
                const list = await fetchGenres();
                if (!cancelled) setGenres(list);
            } catch (e) {
                console.error("장르 목록을 불러오지 못했습니다.", e);
            }
        };

        void loadGenres();
        return () => {
            cancelled = true;
        };
    }, []);

    /* ===== Table View 데이터 로딩 ===== */
    useEffect(() => {
        if (view !== "table") return;

        let cancelled = false;

        const load = async () => {
            try {
                setTableLoading(true);
                setErrorMsg(null);

                const genreId =
                    selectedGenre === "all" ? undefined : selectedGenre;

                const movies =
                    genreId === undefined
                        ? await fetchPopular(tablePage)
                        : await fetchDiscover({
                            page: tablePage,
                            with_genres: genreId,
                            sort_by: "popularity.desc",
                        });

                if (!cancelled) {
                    setTableMovies(movies);
                }
            } catch {
                if (!cancelled) {
                    setErrorMsg("인기 영화를 불러오지 못했습니다.");
                }
            } finally {
                if (!cancelled) {
                    setTableLoading(false);
                }
            }
        };

        void load();
        return () => {
            cancelled = true;
        };
    }, [view, tablePage, selectedGenre]);

    /* ===== Infinite Scroll 로딩 함수 ===== */
    const loadMoreScroll = useCallback(() => {
        if (scrollLoading || !hasMore || view !== "infinite") return;

        setScrollLoading(true);
        const currentPage = scrollPage;

        const doLoad = async () => {
            try {
                const genreId =
                    selectedGenre === "all" ? undefined : selectedGenre;

                const movies =
                    genreId === undefined
                        ? await fetchPopular(currentPage)
                        : await fetchDiscover({
                            page: currentPage,
                            with_genres: genreId,
                            sort_by: "popularity.desc",
                        });

                setScrollMovies((prev) => [...prev, ...movies]);

                const nextPage = currentPage + 1;
                setScrollPage(nextPage);
                if (nextPage > MAX_PAGE) {
                    setHasMore(false);
                }
            } catch {
                setErrorMsg(
                    "인기 영화를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
                );
                setHasMore(false);
            } finally {
                setScrollLoading(false);
            }
        };

        void doLoad();
    }, [scrollLoading, hasMore, view, scrollPage, selectedGenre]);

    /* ✅ Infinite로 전환될 때 최초 1번 로딩 */
    useEffect(() => {
        if (view !== "infinite") return;
        if (scrollMovies.length === 0 && !scrollLoading && hasMore) {
            loadMoreScroll();
        }
    }, [view, scrollMovies.length, scrollLoading, hasMore, loadMoreScroll]);

    /* ===== IntersectionObserver로 무한 스크롤 감시 ===== */
    useEffect(() => {
        if (view !== "infinite") return;

        const target = sentinelRef.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting) {
                    loadMoreScroll();
                }
            },
            {
                root: null,
                rootMargin: "0px 0px 400px 0px", // 화면 아래쪽 근처에서 미리 로딩
                threshold: 0,
            }
        );

        observer.observe(target);
        return () => {
            observer.disconnect();
        };
    }, [view, loadMoreScroll]);

    /* ===== 핸들러들 ===== */

    const handleTopClick = () => {
        // 1) 인기 영화 페이지 컨테이너를 기준으로 스크롤
        const container = document.querySelector(".popular-container");

        if (container && "scrollIntoView" in container) {
            container.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            // 2) 혹시 몰라서 window도 같이 처리
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleSwitchToTable = () => {
        setView("table");
        window.scrollTo({ top: 0 });
    };

    const handleSwitchToInfinite = () => {
        setView("infinite");
        window.scrollTo({ top: 0 });
        // 실제 로딩은 위 useEffect에서 처리
    };

    const handleGenreChange = (value: string) => {
        const next = value === "" || value === "all" ? "all" : Number(value);

        setSelectedGenre(next);

        // Table View 초기화
        setTablePage(1);
        setTableMovies([]);

        // Infinite Scroll도 장르 바꾸면 새로 로딩하도록 초기화
        setScrollMovies([]);
        setScrollPage(1);
        setHasMore(true);

        window.scrollTo({ top: 0 });
    };

    const renderMovieCard = (m: Movie) => {
        const wished = isInWishlist(m.id);

        return (
            <div key={m.id} className="popular-card">
                <div className="poster-wrap">
                    {m.poster_path ? (
                        <img
                            src={TMDB_IMAGE_BASE + m.poster_path}
                            alt={m.title}
                        />
                    ) : (
                        <div className="poster-placeholder">
                            <FaSpinner className="spin-icon" />
                            No Image
                        </div>
                    )}

                    <button
                        type="button"
                        className={"favorite-btn" + (wished ? " active" : "")}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(m);
                        }}
                        title={wished ? "찜 목록에서 제거" : "찜 목록에 추가"}
                    >
                        {wished ? <FaHeart /> : <FaRegHeart />}
                    </button>
                </div>
                <div className="card-title">{m.title}</div>
                <div className="card-meta">
                    <span>
                        <FaStar /> {m.vote_average?.toFixed(1) ?? "-"}
                    </span>
                    <span>{m.release_date?.slice(0, 4) ?? ""}</span>
                </div>
            </div>
        );
    };

    /* ===== 렌더 ===== */
    return (
        <div className="popular-container">
            <header className="popular-header">
                <h1 className="popular-title">
                    <FaFire /> 인기 영화
                </h1>

                <div className="view-toggle">
                    <button
                        type="button"
                        className={
                            "toggle-btn" + (view === "table" ? " active" : "")
                        }
                        onClick={handleSwitchToTable}
                    >
                        <FaThLarge /> Table View
                    </button>
                    <button
                        type="button"
                        className={
                            "toggle-btn" +
                            (view === "infinite" ? " active" : "")
                        }
                        onClick={handleSwitchToInfinite}
                    >
                        <FaInfinity /> Infinite Scroll
                    </button>
                </div>
            </header>

            {/* 장르 필터 (두 View 공통) */}
            {genres.length > 0 && (
                <div className="popular-genre-bar">
                    <span className="popular-genre-label">장르</span>
                    <select
                        value={selectedGenre === "all" ? "" : selectedGenre}
                        onChange={(e) => handleGenreChange(e.target.value)}
                    >
                        <option value="">전체 장르</option>
                        {genres.map((g) => (
                            <option key={g.id} value={g.id}>
                                {g.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {errorMsg && <div className="popular-error">{errorMsg}</div>}

            {/* Table View */}
            {view === "table" && (
                <div className="table-wrap">
                    {tableLoading && tableMovies.length === 0 ? (
                        <div className="popular-loading">
                            <FaSpinner className="spin-icon" />
                            영화 목록을 불러오는 중...
                        </div>
                    ) : (
                        <>
                            <div className="popular-grid">
                                {tableMovies.map(renderMovieCard)}
                            </div>

                            <div className="popular-pagination">
                                <button
                                    type="button"
                                    className="page-btn"
                                    disabled={tablePage <= 1}
                                    onClick={() =>
                                        setTablePage((p) => Math.max(1, p - 1))
                                    }
                                    aria-label="이전 페이지"
                                >
                                    <FaChevronLeft />
                                </button>

                                <span className="page-info">
                                    Page{" "}
                                    <b style={{ color: "#fff" }}>
                                        {tablePage}
                                    </b>
                                </span>

                                <button
                                    type="button"
                                    className="page-btn"
                                    disabled={tablePage >= MAX_PAGE}
                                    onClick={() =>
                                        setTablePage((p) =>
                                            Math.min(MAX_PAGE, p + 1)
                                        )
                                    }
                                    aria-label="다음 페이지"
                                >
                                    <FaChevronRight />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Infinite Scroll View */}
            {view === "infinite" && (
                <>
                    <div className="scroll-wrap">
                        {scrollMovies.length > 0 && (
                            <div className="popular-loading">
                                총 <b>{scrollMovies.length}</b>개의 영화 로드됨
                            </div>
                        )}

                        <div className="popular-grid">
                            {scrollMovies.map(renderMovieCard)}
                        </div>

                        {scrollLoading && hasMore && (
                            <div className="popular-loading">
                                <FaSpinner className="spin-icon" />
                                다음 영화 목록을 불러오는 중...
                            </div>
                        )}

                        {!hasMore && scrollMovies.length > 0 && (
                            <div className="popular-loading">
                                모든 인기 영화 ({MAX_PAGE} 페이지)를 다
                                불러왔습니다.
                            </div>
                        )}

                        {/* 👀 이 div가 화면 하단에 보이면 다음 페이지 로딩 */}
                        <div ref={sentinelRef} />
                    </div>

                    {/* 항상 화면 오른쪽 아래에 떠 있는 TOP 버튼 */}
                    {scrollMovies.length > 0 && (
                        <TopButtonPortal onClick={handleTopClick} />
                    )}
                </>
            )}
        </div>
    );
};
