import { useState } from 'react';
import SearchBar from './components/SearchBar';
import MovieList from './components/MovieList';
import { api } from './services/api';
import type { Movie } from './types';
import './App.css';

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSearch = async (searchQuery: string) => {
    setIsLoading(true);
    setError('');
    setQuery(searchQuery);
    
    try {
      const response = await api.getRecommendations(searchQuery);
      setMovies(response.movies);
    } catch (err) {
      setError('Failed to fetch recommendations. Please try again.');
      console.error('Search error:', err);
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplain = async (query: string, movie: string): Promise<string> => {
    try {
      const response = await api.explainMovie(query, movie);
      return response.explanation;
    } catch (err) {
      console.error('Explain error:', err);
      throw new Error('Failed to fetch explanation');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          🍿 PopChoice
        </h1>
        <p className="app-subtitle">
          Discover your next favorite movie with AI-powered recommendations
        </p>
      </header>

      <main className="app-main">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {isLoading && (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Finding perfect movies for you...</p>
          </div>
        )}

        {!isLoading && !error && movies.length > 0 && (
          <MovieList 
            movies={movies} 
            query={query}
            onExplain={handleExplain}
          />
        )}

        {!isLoading && !error && query && movies.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">🎬</div>
            <h3>No movies found</h3>
            <p>Try a different search query</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by AI • Find movies that match your mood</p>
      </footer>
    </div>
  );
}

export default App;
