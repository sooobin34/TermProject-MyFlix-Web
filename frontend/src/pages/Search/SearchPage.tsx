// src/pages/Search/SearchPage.tsx
import { useEffect, useState } from "react";
import {
    FaSearch,
    FaUndo,
    FaHeart,
    FaRegHeart,
    FaStar,
    FaChevronLeft,
    FaChevronRight,
} from "react-icons/fa";
import type { Movie, Genre } from "../../api/tmdb";
import { fetchDiscover, fetchGenres, TMDB_IMAGE_BASE } from "../../api/tmdb";
import { useWishlist } from "../../hooks/useWishlist";
import "./search.css";

/** ✅ 프로필별 최근 검색어 prefix */
const RECENT_SEARCH_PREFIX = "search:recentKeywords:";

/** ✅ localStorage에서 현재 프로필 ID 가져오기 (없으면 default) */
function getProfileIdSafe(): string {
    if (typeof window === "undefined") return "default";
    try {
        // 👉 여기서 실제 네가 쓰는 키로 바꿔도 됨 (예: "myflix:userId")
        const id = localStorage.getItem("myflix:activeProfileId");
        return id && id.trim().length > 0 ? id : "default";
    } catch {
        return "default";
    }
}

export const SearchPage = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    // 필터 상태
    const [selectedGenre, setSelectedGenre] = useState<number | "all">("all");
    const [minRating, setMinRating] = useState<number>(0);
    const [sortBy, setSortBy] = useState<string>("popularity.desc");
    const [searchText, setSearchText] = useState("");

    // ✅ 최근 검색어 상태
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // ❗ useState 제거하고 매 렌더마다 현재 프로필 기준 key 계산
    const profileId = getProfileIdSafe();
    const storageKey = `${RECENT_SEARCH_PREFIX}${profileId}`;

    const { toggleWishlist, isInWishlist } = useWishlist();

    /* ===========================
       최근 검색어 LocalStorage 로딩
    ============================ */
    useEffect(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return;

            const parsed = JSON.parse(raw) as unknown;
            if (
                Array.isArray(parsed) &&
                parsed.every((item): item is string => typeof item === "string")
            ) {
                setRecentSearches(parsed);
            }
        } catch {
            // 손상된 데이터면 무시
        }
    }, [storageKey]);

    /* ===========================
       장르 목록 불러오기
    ============================ */
    useEffect(() => {
        let cancelled = false;

        async function loadGenres() {
            const g = await fetchGenres();
            if (!cancelled) setGenres(g);
        }

        void loadGenres();
        return () => {
            cancelled = true;
        };
    }, []);

    /* ===========================
       영화 목록 불러오기
    ============================ */
    useEffect(() => {
        let cancelled = false;

        async function loadMovies() {
            setLoading(true);
            try {
                const list = await fetchDiscover({
                    page,
                    with_genres:
                        selectedGenre === "all" ? undefined : selectedGenre,
                    vote_average_gte: minRating,
                    sort_by: sortBy,
                });

                if (!cancelled) {
                    setMovies(list);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void loadMovies();
        return () => {
            cancelled = true;
        };
    }, [page, selectedGenre, minRating, sortBy]);

    /* ===========================
       최근 검색어 저장 로직
    ============================ */
    const saveRecentSearch = (keyword: string) => {
        const trimmed = keyword.trim();
        if (!trimmed) return;

        setRecentSearches((prev) => {
            // 중복 제거 + 맨 앞에 추가 + 최대 5개 유지
            const next = [trimmed, ...prev.filter((q) => q !== trimmed)].slice(
                0,
                5
            );
            try {
                localStorage.setItem(storageKey, JSON.stringify(next));
            } catch {
                // 용량 초과 등은 그냥 무시
            }
            return next;
        });
    };

    const handleSearchExecute = () => {
        saveRecentSearch(searchText);
        setPage(1);
    };

    const handleClickRecent = (keyword: string) => {
        setSearchText(keyword);
        setPage(1);
    };

    const handleClearRecent = () => {
        setRecentSearches([]);
        try {
            localStorage.removeItem(storageKey);
        } catch {
            // ignore
        }
    };

    const resetFilters = () => {
        setSelectedGenre("all");
        setMinRating(0);
        setSortBy("popularity.desc");
        setSearchText("");
        setPage(1);
    };

    // 제목 기준 클라이언트 검색
    const filteredMovies = movies.filter((m) =>
        m.title.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className="search-container">
            {/* 헤더 섹션 */}
            <h1 className="search-title">
                콘텐츠 탐색{" "}
                <span
                    style={{
                        fontSize: "0.5em",
                        color: "#666",
                        fontWeight: 400,
                    }}
                >
                    Discovery
                </span>
            </h1>

            {/* 필터 컨트롤 패널 */}
            <div className="search-filters">
                {/* 1. 검색어 입력 */}
                <div className="filter-group" style={{ flex: 2 }}>
                    <label htmlFor="search">제목 검색</label>
                    <div style={{ position: "relative" }}>
                        <input
                            id="search"
                            type="text"
                            placeholder="찾고 싶은 영화 제목..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSearchExecute();
                                }
                            }}
                            style={{ paddingLeft: "36px" }} // 아이콘 공간
                        />
                        <FaSearch
                            style={{
                                position: "absolute",
                                left: "12px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#888",
                            }}
                        />
                    </div>
                </div>

                {/* 2. 장르 선택 */}
                <div className="filter-group">
                    <label htmlFor="genre">장르</label>
                    <select
                        id="genre"
                        value={selectedGenre}
                        onChange={(e) =>
                            setSelectedGenre(
                                e.target.value === "all"
                                    ? "all"
                                    : Number(e.target.value)
                            )
                        }
                    >
                        <option value="all">모든 장르</option>
                        {genres.map((g) => (
                            <option key={g.id} value={g.id}>
                                {g.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 3. 정렬 기준 */}
                <div className="filter-group">
                    <label htmlFor="sort">정렬 기준</label>
                    <select
                        id="sort"
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="popularity.desc">🔥 인기순</option>
                        <option value="vote_average.desc">
                            ⭐ 평점 높은순
                        </option>
                        <option value="release_date.desc">
                            📅 최신 개봉순
                        </option>
                    </select>
                </div>

                {/* 4. 평점 슬라이더 */}
                <div className="filter-group" style={{ minWidth: "180px" }}>
                    <label
                        htmlFor="rating"
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <span>최소 평점</span>
                        <span
                            style={{
                                color: "var(--netflix-red)",
                                fontWeight: "bold",
                            }}
                        >
                            {minRating}점 이상
                        </span>
                    </label>
                    <input
                        id="rating"
                        type="range"
                        min={0}
                        max={10}
                        step={1}
                        value={minRating}
                        onChange={(e) => {
                            setMinRating(Number(e.target.value));
                            setPage(1);
                        }}
                    />
                </div>

                {/* 액션 버튼 */}
                <div className="filter-actions">
                    {/* 첫 번째 버튼: 검색 실행 */}
                    <button
                        type="button"
                        onClick={handleSearchExecute}
                        title="검색 실행"
                    >
                        <FaSearch style={{ marginRight: "6px" }} /> 검색
                    </button>

                    {/* 두 번째 버튼: 초기화 */}
                    <button
                        type="button"
                        onClick={resetFilters}
                        title="필터 초기화"
                    >
                        <FaUndo style={{ marginRight: "6px" }} /> 초기화
                    </button>
                </div>
            </div>

            {/* ✅ 최근 검색어 UI */}
            {recentSearches.length > 0 && (
                <div className="recent-searches">
                    <span className="recent-label">최근 검색어</span>
                    <div className="recent-chips">
                        {recentSearches.map((keyword) => (
                            <button
                                key={keyword}
                                type="button"
                                className="recent-chip"
                                onClick={() => handleClickRecent(keyword)}
                            >
                                {keyword}
                            </button>
                        ))}
                        <button
                            type="button"
                            className="recent-clear"
                            onClick={handleClearRecent}
                        >
                            전체 지우기
                        </button>
                    </div>
                </div>
            )}

            {/* 메인 콘텐츠 영역 */}
            {loading ? (
                <div className="search-loading">
                    <div style={{ fontSize: "2rem", marginBottom: "10px" }}>
                        🍿
                    </div>
                    콘텐츠를 불러오는 중입니다...
                </div>
            ) : (
                <>
                    <div className="search-table-wrap">
                        <table className="search-table">
                            <thead>
                            <tr>
                                <th style={{ width: "60px" }}>포스터</th>
                                <th>제목</th>
                                <th style={{ width: "100px" }}>평점</th>
                                <th style={{ width: "100px" }}>
                                    개봉년도
                                </th>
                                <th
                                    style={{
                                        width: "80px",
                                        textAlign: "center",
                                    }}
                                >
                                    찜하기
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredMovies.map((m) => (
                                <tr key={m.id}>
                                    <td className="search-poster-cell">
                                        <img
                                            src={
                                                m.poster_path
                                                    ? `${TMDB_IMAGE_BASE}${m.poster_path}`
                                                    : "https://via.placeholder.com/50x75?text=No+Img"
                                            }
                                            alt={m.title}
                                            loading="lazy"
                                        />
                                    </td>
                                    <td style={{ fontWeight: 500 }}>
                                        {m.title}
                                    </td>
                                    <td>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "4px",
                                            }}
                                        >
                                            <FaStar
                                                color="#e50914"
                                                size={12}
                                            />
                                            <span>
                                                    {m.vote_average?.toFixed(1)}
                                                </span>
                                        </div>
                                    </td>
                                    <td style={{ color: "#888" }}>
                                        {m.release_date?.slice(0, 4) ??
                                            "-"}
                                    </td>
                                    <td align="center">
                                        <button
                                            className={
                                                isInWishlist(m.id)
                                                    ? "wish-btn active"
                                                    : "wish-btn"
                                            }
                                            onClick={() =>
                                                toggleWishlist(m)
                                            }
                                            title={
                                                isInWishlist(m.id)
                                                    ? "찜 목록에서 제거"
                                                    : "찜 목록에 추가"
                                            }
                                        >
                                            {isInWishlist(m.id) ? (
                                                <FaHeart />
                                            ) : (
                                                <FaRegHeart />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {filteredMovies.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        style={{
                                            textAlign: "center",
                                            padding: "60px 0",
                                            color: "#666",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: "2rem",
                                                marginBottom: "10px",
                                            }}
                                        >
                                            😢
                                        </div>
                                        검색 조건에 맞는 영화를 찾을 수
                                        없습니다.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* 페이지네이션 */}
                    <div className="search-pagination">
                        <button
                            disabled={page <= 1}
                            onClick={() =>
                                setPage((p) => Math.max(1, p - 1))
                            }
                        >
                            <FaChevronLeft />
                        </button>
                        <span
                            style={{
                                margin: "0 10px",
                                color: "#888",
                            }}
                        >
                            Page{" "}
                            <b style={{ color: "#fff" }}>{page}</b>
                        </span>
                        <button onClick={() => setPage((p) => p + 1)}>
                            <FaChevronRight />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
