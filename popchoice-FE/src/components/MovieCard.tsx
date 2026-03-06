import { useState } from 'react';
import type { Movie } from '../types';
import './MovieCard.css';

interface MovieCardProps {
  movie: Movie;
  query: string;
  onExplain: (query: string, movie: string) => Promise<string>;
}

export default function MovieCard({ movie, query, onExplain }: MovieCardProps) {
  const [explanation, setExplanation] = useState<string>('');
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleExplain = async () => {
    if (explanation) {
      setShowExplanation(!showExplanation);
      return;
    }

    setIsLoadingExplanation(true);
    try {
      const result = await onExplain(query, movie.title);
      setExplanation(result);
      setShowExplanation(true);
    } catch (error) {
      console.error('Error fetching explanation:', error);
      setExplanation('Failed to load explanation. Please try again.');
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const matchScore = movie.similarity 
    ? Math.round((1 - movie.similarity) * 100)
    : null;

  return (
    <div className="movie-card">
      <div className="movie-header">
        <div className="movie-title-row">
          <h3 className="movie-title">{movie.title}</h3>
          <span className="movie-year">{movie.year}</span>
        </div>
        {matchScore !== null && (
          <div className="match-score">
            <span className="match-percentage">{matchScore}%</span>
            <span className="match-label">Match</span>
          </div>
        )}
      </div>
      
      <div className="movie-genre">{movie.genre}</div>
      <p className="movie-description">{movie.description}</p>
      
      <button 
        className="explain-button"
        onClick={handleExplain}
        disabled={isLoadingExplanation}
      >
        {isLoadingExplanation ? 'Loading...' : showExplanation ? 'Hide Explanation' : 'Why this movie?'}
      </button>
      
      {showExplanation && explanation && (
        <div className="explanation">
          <p>{explanation}</p>
        </div>
      )}
    </div>
  );
}
