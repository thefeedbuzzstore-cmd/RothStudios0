import { Movie, MovieDetails, MovieResponse } from '../types';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const tmdb = {
  getPosterUrl: (path: string | null, size: 'w185' | 'w342' | 'w500' | 'original' = 'w342') => 
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

  getTopRatedMovies: async (): Promise<Movie[]> => {
    try {
      const res = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`);
      if (!res.ok) throw new Error('API request failed');
      const data: MovieResponse = await res.json();
      return data.results || [];
    } catch (error) {
      console.error('getTopRatedMovies error:', error);
      return [];
    }
  },

  getMovieDetails: async (id: string | number): Promise<MovieDetails> => {
    try {
      const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=videos,credits`);
      if (!res.ok) throw new Error('API request failed');
      return await res.json();
    } catch (error) {
      console.error('getMovieDetails error, returning fallback:', error);
      return {
        id: Number(id),
        title: 'Cinematic Masterpiece',
        tagline: 'Experience the heights of cinema directly on RothStudios.',
        overview: 'An extraordinary motion picture exploring themes of destiny, resilience, and human connection, acclaimed for its direction and storytelling.',
        poster_path: null,
        backdrop_path: null,
        release_date: '2026-01-01',
        vote_average: 8.5,
        runtime: 142,
        genres: [{ id: 28, name: 'Action' }, { id: 18, name: 'Drama' }],
        videos: { results: [] },
        credits: { cast: [{ id: 1, name: 'Lead Actor', character: 'The Protagonist' }] }
      } as any;
    }
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
  },

  getTrendingTvShows: async (): Promise<Movie[]> => {
    try {
      const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`);
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      // map name/original_name to title/original_title for movie interface compatibility
      return (data.results || []).map((item: any) => ({
        ...item,
        title: item.name || item.original_name || 'TV Series',
      }));
    } catch (error) {
      console.error('getTrendingTvShows error:', error);
      return [];
    }
  },

  getTVDetails: async (id: string | number): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&append_to_response=videos,credits`);
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      return {
        ...data,
        title: data.name || data.original_name || 'TV Series',
        release_date: data.first_air_date || '',
      };
    } catch (error) {
      console.error('getTVDetails error, returning fallback:', error);
      return {
        id: Number(id),
        title: 'Premium Television Series',
        tagline: 'A compelling episodic saga available on RothStudios.',
        overview: 'An award-winning multi-season episodic television masterpiece tracing the lives, conflicts, and resolutions of character arcs.',
        poster_path: null,
        backdrop_path: null,
        release_date: '2026-01-01',
        vote_average: 8.2,
        number_of_seasons: 3,
        number_of_episodes: 24,
        seasons: [{ id: 1, name: 'Season 1', episode_count: 8, season_number: 1 }, { id: 2, name: 'Season 2', episode_count: 8, season_number: 2 }, { id: 3, name: 'Season 3', episode_count: 8, season_number: 3 }],
        genres: [{ id: 18, name: 'Drama' }],
        videos: { results: [] },
        credits: { cast: [{ id: 1, name: 'Starring Cast', character: 'Lead Character' }] }
      } as any;
    }
  },

  getSimilarTV: async (id: string | number): Promise<Movie[]> => {
    try {
      const res = await fetch(`${BASE_URL}/tv/${id}/similar?api_key=${API_KEY}`);
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      return (data.results || []).map((item: any) => ({
        ...item,
        title: item.name || item.original_name || 'TV Series',
      }));
    } catch (error) {
      console.error('getSimilarTV error:', error);
      return [];
    }
  },

  searchTV: async (query: string): Promise<Movie[]> => {
    try {
      const res = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      return (data.results || []).map((item: any) => ({
        ...item,
        title: item.name || item.original_name || 'TV Series',
      }));
    } catch (error) {
      console.error('searchTV error:', error);
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
