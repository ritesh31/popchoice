import type { Movie } from '../types';
import MovieCard from './MovieCard';
import './MovieList.css';

interface MovieListProps {
  movies: Movie[];
  query: string;
  onExplain: (query: string, movie: string) => Promise<string>;
}

export default function MovieList({ movies, query, onExplain }: MovieListProps) {
  if (movies.length === 0) {
    return (
      <div className="no-results">
        <div className="no-results-icon">🎬</div>
        <h3>No movies found</h3>
        <p>Try a different search query</p>
      </div>
    );
  }

  return (
    <div className="movie-list">
      <h2 className="results-title">
        Recommended Movies
        <span className="results-count">{movies.length} {movies.length === 1 ? 'result' : 'results'}</span>
      </h2>
      <div className="movie-grid">
        {movies.map((movie, index) => (
          <MovieCard 
            key={`${movie.title}-${index}`}
            movie={movie}
            query={query}
            onExplain={onExplain}
          />
        ))}
      </div>
    </div>
  );
}
