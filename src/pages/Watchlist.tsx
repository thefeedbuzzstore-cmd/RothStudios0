import React from 'react';
import { useWatchlist } from '../context/WatchlistContext';
import { MovieCard } from '../components/MovieCard';
import { EmptyState } from '../components/EmptyState';
import { Sparkles } from 'lucide-react';

export default function Watchlist() {
  const { watchlist } = useWatchlist();

  return (
    <div className="pt-24 pb-20 px-4 md:px-12 max-w-7xl mx-auto space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-display font-black text-white uppercase tracking-tight">
          My <span className="text-brand-primary italic">Watchlist</span>
        </h1>
        <p className="text-zinc-500 font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          You have {watchlist.length} {watchlist.length === 1 ? 'movie' : 'movies'} saved.
        </p>
      </div>

      {watchlist.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-12 gap-x-6 border-t border-white/10 pt-12">
          {watchlist.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Your Watchlist is Empty"
          description="Build your personal cinema collection by adding movies you want to watch later."
          actionLabel="Explore Movies"
          actionPath="/"
        />
      )}
    </div>
  );
}
