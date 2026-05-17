import React from 'react';
import { useState, useEffect } from 'react';
import { Search as SearchIcon, X, Sparkles } from 'lucide-react';
import { tmdb, MOOD_GENRE_MAP } from '../services/tmdb';
import { Movie } from '../types';
import { MovieCard } from '../components/MovieCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { analytics } from '../services/analytics';
import { cn } from '../lib/utils';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        if (!activeMood) setResults([]);
        return;
      }
      setLoading(true);
      setActiveMood(null);
      try {
        const data = await tmdb.searchMovies(query);
        setResults(data);

        // Track search
        analytics.trackEvent({
          event_type: 'search',
          user_id: user?.id || null,
          metadata: { query }
        });

      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(search, 500);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleMoodSearch = async (mood: string) => {
    setLoading(true);
    setQuery('');
    setActiveMood(mood);
    try {
      const genreId = MOOD_GENRE_MAP[mood];
      const data = await tmdb.getMoviesByGenre(genreId);
      setResults(data);
    } catch (error) {
      console.error('Mood search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 px-4 md:px-12 max-w-7xl mx-auto space-y-12">
      <div className="space-y-8 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-display font-black text-white uppercase tracking-tight">
          Discovery <span className="text-brand-primary italic">Engine</span>
        </h1>
        
        <div className="relative group">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 w-6 h-6 group-focus-within:text-brand-primary transition-colors" />
          <input
            type="text"
            placeholder="Search for movies, actors, or directors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary placeholder:font-medium transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-zinc-500 font-medium flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            What's your mood today?
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {Object.keys(MOOD_GENRE_MAP).map((mood) => (
              <Button
                key={mood}
                variant="secondary"
                size="sm"
                className={cn(
                  "rounded-full capitalize border border-white/5 px-6",
                  activeMood === mood && "bg-brand-primary/20 border-brand-primary/50 text-brand-primary"
                )}
                onClick={() => handleMoodSearch(mood)}
              >
                {mood}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl font-display font-bold text-white uppercase tracking-wider">
            {loading ? 'Searching...' : results.length > 0 ? `Results (${results.length})` : 'Popular Searches'}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-12 gap-x-6">
            {results.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : query ? (
          <EmptyState
            title="No Results Found"
            description={`We couldn't find any movies matching "${query}"`}
            icon="search"
          />
        ) : !activeMood && (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-lg">Try searching for something or choose a mood above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
