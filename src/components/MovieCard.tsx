import React from 'react';
import { motion } from 'motion/react';
import { Play, Plus, Info, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Movie } from '../types';
import { tmdb } from '../services/tmdb';
import { useWatchlist } from '../context/WatchlistContext';
import { useAuth } from '../context/AuthContext';
import { analytics } from '../services/analytics';
import { Button } from './Button';
import { cn } from '../lib/utils';

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { user } = useAuth();
  const isAdded = isInWatchlist(movie.id);

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdded) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
      // Track watchlist add
      analytics.trackEvent({
        event_type: 'watchlist_add',
        user_id: user?.id || null,
        movie_id: movie.id,
        metadata: { title: movie.title }
      });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8 }}
      className="relative flex-none w-[180px] md:w-[240px] group cursor-pointer"
    >
      <Link to={`/movie/${movie.id}`}>
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-white/10 ring-0 group-hover:ring-2 ring-brand-primary/50 transition-all">
          <img
            src={tmdb.getPosterUrl(movie.poster_path)}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <h3 className="text-white font-bold text-sm md:text-base line-clamp-2 mb-2">
              {movie.title}
            </h3>
            
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-xs font-medium">{movie.vote_average.toFixed(1)}</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-medium px-1.5 py-0.5 rounded bg-zinc-800 uppercase">
                {movie.release_date?.split('-')?.[0]}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button size="icon" className="h-9 w-9 rounded-full bg-white text-black hover:bg-zinc-200">
                <Play className="w-4 h-4 fill-current" />
              </Button>
              <Button 
                variant="secondary" 
                size="icon" 
                className={cn("h-9 w-9 rounded-full border border-white/20", isAdded && "bg-brand-primary/20 border-brand-primary/50")}
                onClick={toggleWatchlist}
              >
                <Plus className={cn("w-4 h-4 transition-transform", isAdded && "rotate-45 text-brand-primary")} />
              </Button>
              <Button variant="secondary" size="icon" className="h-9 w-9 rounded-full border border-white/20">
                <Info className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
