export interface Movie {
  title: string;
  genre: string;
  description: string;
  year: number;
  similarity?: number;
}

export interface RecommendResponse {
  query: string;
  movies: Movie[];
}

export interface ExplainResponse {
  movie: string;
  explanation: string;
}
