// src/components/movies/MovieCard.tsx
import type { Movie } from "../../api/tmdb";
import { TMDB_IMAGE_BASE } from "../../api/tmdb";
import "./movies.css";

interface MovieCardProps {
    movie: Movie;
    isWishlisted: boolean;
    onToggleWishlist: () => void;
}

export const MovieCard = ({
                              movie,
                              isWishlisted,
                              onToggleWishlist,
                          }: MovieCardProps) => {
    const imageUrl = movie.poster_path
        ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
        : "https://via.placeholder.com/300x450?text=No+Image";

    return (
        <div className="movie-card" onClick={onToggleWishlist}>
            <img src={imageUrl} alt={movie.title} />
            <div className="movie-card-info">
                <div className="movie-card-title">{movie.title}</div>
                {movie.vote_average && (
                    <div className="movie-card-meta">
                        ⭐ {movie.vote_average.toFixed(1)}
                        {movie.release_date ? ` · ${movie.release_date.slice(0, 4)}` : ""}
                    </div>
                )}
            </div>
            <div
                className={`movie-card-badge ${
                    isWishlisted ? "" : "outlined"
                }`}
            >
                {isWishlisted ? "추천됨" : "추천하기"}
            </div>
        </div>
    );
};
