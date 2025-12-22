// src/pages/Wishlist/WishlistPage.tsx
import { TMDB_IMAGE_BASE } from "../../api/tmdb";
import { useWishlist } from "../../hooks/useWishlist";
import "./wishlist.css";

export const WishlistPage = () => {
    const { wishlist, toggleWishlist } = useWishlist();

    return (
        <div className="wishlist-container">
            <h1 className="wishlist-title">내가 찜한 리스트</h1>

            {wishlist.length === 0 ? (
                <div className="wishlist-empty">
                    <p>아직 찜한 영화가 없습니다.</p>
                    <p>Home / Popular / Search 페이지에서 마음에 드는 영화를 찜해보세요.</p>
                </div>
            ) : (
                <div className="wishlist-grid">
                    {wishlist.map((m) => (
                        <div key={m.id} className="wishlist-card">
                            <div className="wishlist-poster-wrap">
                                <img
                                    src={
                                        m.poster_path
                                            ? `${TMDB_IMAGE_BASE}${m.poster_path}`
                                            : "https://via.placeholder.com/300x450"
                                    }
                                    alt={m.title}
                                />
                                <button
                                    className="wishlist-badge"
                                    onClick={() => toggleWishlist(m)}
                                >
                                    찜 해제
                                </button>
                            </div>

                            <div className="wishlist-info">
                                <h2 className="wishlist-movie-title">{m.title}</h2>
                                <div className="wishlist-meta">
                                    <span>⭐ {m.vote_average?.toFixed(1) ?? "N/A"}</span>
                                    <span>{m.release_date?.slice(0, 4) ?? "-"}</span>
                                </div>
                                {m.overview && (
                                    <p className="wishlist-overview">
                                        {m.overview.length > 90
                                            ? `${m.overview.slice(0, 90)}…`
                                            : m.overview}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
