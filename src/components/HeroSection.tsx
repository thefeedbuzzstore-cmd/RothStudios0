import { motion } from 'motion/react';
import { Play, Info, Star, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Movie } from '../types';
import { tmdb } from '../services/tmdb';
import { Button } from './Button';

interface HeroSectionProps {
  movie: Movie;
}

export function HeroSection({ movie }: HeroSectionProps) {
  return (
    <div className="relative w-full h-[65vh] md:h-[85vh] overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0">
        <img
          src={tmdb.getBackdropUrl(movie.backdrop_path, 'original')}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-dark via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end px-4 md:px-12 pb-16 md:pb-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl space-y-6"
        >
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="flex items-center gap-1.5 text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              {movie.vote_average.toFixed(1)} Rating
            </span>
            <span className="text-zinc-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {movie.release_date?.split('-')?.[0]}
            </span>
            <span className="text-zinc-300 border border-zinc-500/50 px-2 py-0.5 rounded text-xs uppercase tracking-wider">
              HD
            </span>
          </div>

          <h1 className="text-4xl md:text-7xl font-display font-black text-white leading-tight tracking-tight uppercase">
            {movie.title}
          </h1>

          <p className="text-zinc-300 text-base md:text-lg line-clamp-3 md:line-clamp-4 leading-relaxed max-w-xl">
            {movie.overview}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link to={`/movie/${movie.id}`}>
              <Button size="lg" className="gap-2 shadow-xl shadow-brand-primary/20">
                <Play className="w-6 h-6 fill-current" />
                Play Now
              </Button>
            </Link>
            <Link to={`/movie/${movie.id}`}>
              <Button variant="secondary" size="lg" className="gap-2">
                <Info className="w-6 h-6" />
                More Info
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
