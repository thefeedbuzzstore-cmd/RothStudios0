export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Video {
  key: string;
  site: string;
  type: string;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number;
  tagline: string;
  videos: {
    results: Video[];
  };
  credits: {
    cast: CastMember[];
  };
}

export interface MovieResponse {
  results: Movie[];
  page: number;
  total_pages: number;
}

// Supabase Types
export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface AffiliateClick {
  id: string;
  user_id: string | null;
  movie_id: number;
  platform: 'amazon' | 'netflix' | 'apple';
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_type: 'view' | 'search' | 'click' | 'watchlist_add';
  user_id: string | null;
  movie_id?: number;
  metadata: any;
  created_at: string;
}

export interface AppConfig {
  id: string;
  key: string;
  value: any;
  updated_at: string;
}
