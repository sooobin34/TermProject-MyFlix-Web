// src/components/movies/MovieRow.tsx
import type { Movie } from "../../api/tmdb";
import "./movies.css";
import { MovieCard } from "./MovieCard";

interface MovieRowProps {
    title: string;
    movies: Movie[];
    isLoading: boolean;
    isInWishlist: (id: number) => boolean;
    onToggleWishlist: (movie: Movie) => void;
}

export const MovieRow = ({
                             title,
                             movies,
                             isLoading,
                             isInWishlist,
                             onToggleWishlist,
                         }: MovieRowProps) => {
    return (
        <section className="movie-section">
            <h2 className="movie-section-title">{title}</h2>

            {isLoading ? (
                <div className="movie-row-loading">
                    <div className="movie-skeleton" />
                    <div className="movie-skeleton" />
                    <div className="movie-skeleton" />
                    <div className="movie-skeleton" />
                </div>
            ) : (
                <div className="movie-row">
                    {movies.map((movie) => (
                        <MovieCard
                            key={movie.id}
                            movie={movie}
                            isWishlisted={isInWishlist(movie.id)}
                            onToggleWishlist={() => onToggleWishlist(movie)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};
