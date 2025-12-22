import axios from "axios";

/* ===========================
   타입 정의
=========================== */

export interface Movie {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path?: string | null;
    vote_average?: number;
    release_date?: string;
    genre_ids?: number[];
}

export interface Genre {
    id: number;
    name: string;
}

/* ===========================
   상수
=========================== */

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

/**
 * 캐시 유지 시간 (2분)
 * → 과제에서 말하는 "데이터 업데이트 주기 관리"
 */
const CACHE_TTL = 1000 * 60 * 2;

/* ===========================
   공통: API Key
=========================== */

function getApiKey(): string {
    const key = localStorage.getItem("TMDb-Key");
    if (!key) {
        throw new Error("TMDb API 키가 없습니다. 로그인 후 다시 시도해주세요.");
    }
    return key;
}

/* ===========================
   캐시 타입
=========================== */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

/* ===========================
   캐시 저장소
=========================== */

/**
 * now_playing / popular / top_rated / trending
 */
const listCache = new Map<string, CacheEntry<Movie[]>>();

/**
 * discover/movie
 */
const discoverCache = new Map<string, CacheEntry<Movie[]>>();

/**
 * 장르 목록 (앱 생애주기 동안 1회)
 */
let genreCache: CacheEntry<Genre[]> | null = null;

/* ===========================
   캐시 유틸
=========================== */

function isValidCache<T>(entry: CacheEntry<T>) {
    return Date.now() - entry.timestamp < CACHE_TTL;
}

/* ===========================
   공통 리스트 fetch
=========================== */

async function fetchMovies(path: string, page = 1): Promise<Movie[]> {
    const apiKey = getApiKey();
    const cacheKey = `${path}?page=${page}`;

    const cached = listCache.get(cacheKey);
    if (cached && isValidCache(cached)) {
        return cached.data;
    }

    const url = `${TMDB_BASE_URL}${path}?api_key=${apiKey}&language=ko-KR&page=${page}`;
    const res = await axios.get(url);
    const results = res.data.results as Movie[];

    listCache.set(cacheKey, {
        data: results,
        timestamp: Date.now(),
    });

    return results;
}

/* ===========================
   기본 리스트 API
=========================== */

export function fetchNowPlaying(page = 1) {
    return fetchMovies("/movie/now_playing", page);
}

export function fetchPopular(page = 1) {
    return fetchMovies("/movie/popular", page);
}

export function fetchTopRated(page = 1) {
    return fetchMovies("/movie/top_rated", page);
}

export function fetchTrending(page = 1) {
    return fetchMovies("/trending/movie/week", page);
}

/* ===========================
   장르 API
=========================== */

export async function fetchGenres(): Promise<Genre[]> {
    const apiKey = getApiKey();

    if (genreCache && isValidCache(genreCache)) {
        return genreCache.data;
    }

    const url = `${TMDB_BASE_URL}/genre/movie/list?api_key=${apiKey}&language=ko-KR`;
    const res = await axios.get(url);
    const genres = res.data.genres as Genre[];

    genreCache = {
        data: genres,
        timestamp: Date.now(),
    };

    return genres;
}

/* ===========================
   Discover (필터 검색)
=========================== */

interface DiscoverParams {
    page?: number;
    with_genres?: number;
    vote_average_gte?: number;
    sort_by?: string;
}

export async function fetchDiscover(
    params: DiscoverParams
): Promise<Movie[]> {
    const apiKey = getApiKey();

    const searchParams = new URLSearchParams();
    searchParams.set("api_key", apiKey);
    searchParams.set("language", "ko-KR");
    searchParams.set("page", String(params.page ?? 1));
    searchParams.set("sort_by", params.sort_by ?? "popularity.desc");
    searchParams.set("include_adult", "false");
    searchParams.set("vote_average.gte", String(params.vote_average_gte ?? 0));

    if (params.with_genres) {
        searchParams.set("with_genres", String(params.with_genres));
    }

    const queryKey = searchParams.toString();

    const cached = discoverCache.get(queryKey);
    if (cached && isValidCache(cached)) {
        return cached.data;
    }

    const url = `${TMDB_BASE_URL}/discover/movie?${queryKey}`;
    const res = await axios.get(url);
    const results = res.data.results as Movie[];

    discoverCache.set(queryKey, {
        data: results,
        timestamp: Date.now(),
    });

    return results;
}
