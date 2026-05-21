import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '../types';
import { MovieCard } from './MovieCard';
import { cn } from '../lib/utils';

interface MovieRowProps {
  title: string;
  description?: string;
  movies: Movie[];
  className?: string;
}

export function MovieRow({ title, description, movies, className }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (movies.length === 0) return null;

  return (
    <div className={cn("space-y-4 px-4 md:px-12", className)}>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight uppercase border-l-4 border-brand-primary pl-3">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors hidden md:block"
            >
              <ChevronLeft className="w-5 h-5 text-zinc-400" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors hidden md:block"
            >
              <ChevronRight className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>
        {description && (
          <p className="text-xs md:text-sm text-zinc-500 max-w-4xl leading-relaxed font-normal italic">
            {description}
          </p>
        )}
      </div>

      <div
        ref={rowRef}
        className="flex items-center gap-4 overflow-x-auto horizontal-scroll-hide-scrollbar pb-8 pt-2"
      >
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}
