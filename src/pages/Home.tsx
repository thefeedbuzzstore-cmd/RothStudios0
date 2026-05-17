import { useState, useEffect } from 'react';
import { tmdb } from '../services/tmdb';
import { Movie } from '../types';
import { HeroSection } from '../components/HeroSection';
import { MovieRow } from '../components/MovieRow';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export default function Home() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingData, popularData, upcomingData] = await Promise.all([
          tmdb.getTrendingMovies(),
          tmdb.getPopularMovies(),
          tmdb.getUpcomingMovies(),
        ]);
        setTrending(trendingData);
        setPopular(popularData);
        setUpcoming(upcomingData);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 pb-12">
        <LoadingSkeleton variant="hero" />
        <LoadingSkeleton variant="row" />
        <LoadingSkeleton variant="row" />
      </div>
    );
  }

  const heroMovie = trending[0];

  return (
    <div className="pb-20 space-y-12">
      {heroMovie && <HeroSection movie={heroMovie} />}
      
      <div className="relative z-10 -mt-16 md:-mt-32 space-y-12">
        <MovieRow title="Trending Now" movies={trending} />
        <MovieRow title="Popular on RothStudios" movies={popular} />
        <MovieRow title="Upcoming Releases" movies={upcoming} />
      </div>
    </div>
  );
}
