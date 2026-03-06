import type { RecommendResponse, ExplainResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
  async getRecommendations(query: string): Promise<RecommendResponse> {
    const response = await fetch(`${API_BASE_URL}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recommendations');
    }

    return response.json();
  },

  async explainMovie(query: string, movie: string): Promise<ExplainResponse> {
    const response = await fetch(`${API_BASE_URL}/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, movie }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch explanation');
    }

    return response.json();
  },
};
