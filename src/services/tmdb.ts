import { Movie, MovieDetails, MovieResponse } from '../types';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const tmdb = {
  getPosterUrl: (path: string | null, size: 'w500' | 'original' = 'w500') => 
    path ? `${IMAGE_BASE_URL}/${size}${path}` : '/placeholder-poster.png',
  
  getBackdropUrl: (path: string | null, size: 'w1280' | 'original' = 'w1280') => 
    path ? `${IMAGE_BASE_URL}/${size}${path}` : '/placeholder-backdrop.png',

  getTrendingMovies: async (): Promise<Movie[]> => {
    try {
      const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
      if (!res.ok) throw new Error('API request failed');
      const data: MovieResponse = await res.json();
      return data.results || [];
    } catch (error) {
      console.error('getTrendingMovies error:', error);
      return [];
    }
  },

  getPopularMovies: async (): Promise<Movie[]> => {
    try {
      const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
      if (!res.ok) throw new Error('API request failed');
      const data: MovieResponse = await res.json();
      return data.results || [];
    } catch (error) {
      console.error('getPopularMovies error:', error);
      return [];
    }
  },

  getUpcomingMovies: async (): Promise<Movie[]> => {
    try {
      const res = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`);
      if (!res.ok) throw new Error('API request failed');
      const data: MovieResponse = await res.json();
      return data.results || [];
    } catch (error) {
      console.error('getUpcomingMovies error:', error);
      return [];
    }
  },

  getMovieDetails: async (id: string | number): Promise<MovieDetails> => {
    const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=videos,credits`);
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  },

  getSimilarMovies: async (id: string | number): Promise<Movie[]> => {
    try {
      const res = await fetch(`${BASE_URL}/movie/${id}/similar?api_key=${API_KEY}`);
      if (!res.ok) throw new Error('API request failed');
      const data: MovieResponse = await res.json();
      return data.results || [];
    } catch (error) {
      console.error('getSimilarMovies error:', error);
      return [];
    }
  },

  searchMovies: async (query: string): Promise<Movie[]> => {
    try {
      const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('API request failed');
      const data: MovieResponse = await res.json();
      return data.results || [];
    } catch (error) {
      console.error('searchMovies error:', error);
      return [];
    }
  },

  getMoviesByGenre: async (genreId: number): Promise<Movie[]> => {
    try {
      const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`);
      if (!res.ok) throw new Error('API request failed');
      const data: MovieResponse = await res.json();
      return data.results || [];
    } catch (error) {
      console.error('getMoviesByGenre error:', error);
      return [];
    }
  }
};

export const MOOD_GENRE_MAP: Record<string, number> = {
  'sad': 18, // Drama
  'motivational': 99, // Documentary (often motivational) or maybe Sport (878 is Sci-Fi)
  'sci-fi mind blowing': 878, // Science Fiction
  'action': 28,
  'comedy': 35,
  'horror': 27,
  'romance': 10749,
  'thriller': 53
};
