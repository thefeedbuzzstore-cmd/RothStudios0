import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, Play, Plus, Clock, Calendar, ExternalLink, ArrowLeft } from 'lucide-react';
import { tmdb } from '../services/tmdb';
import { MovieDetails as MovieDetailsType, Movie } from '../types';
import { useWatchlist } from '../context/WatchlistContext';
import { useAuth } from '../context/AuthContext';
import { analytics } from '../services/analytics';
import { Button } from '../components/Button';
import { MovieRow } from '../components/MovieRow';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { ReviewSection } from '../components/ReviewSection';

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetailsType | null>(null);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [affiliateConfig, setAffiliateConfig] = useState<any>({});
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const [movieData, similarData, { data: configData }] = await Promise.all([
          tmdb.getMovieDetails(id),
          tmdb.getSimilarMovies(id),
          supabase.from('config').select('*')
        ]);
        setMovie(movieData);
        setSimilar(similarData);

        // Convert config array to object
        const configMap = (configData || []).reduce((acc, curr) => ({
          ...acc, [curr.key]: curr.value
        }), {});
        setAffiliateConfig(configMap);

        // Track view
        analytics.trackEvent({
          event_type: 'view',
          user_id: user?.id || null,
          movie_id: Number(id),
          metadata: { title: movieData.title }
        });

      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user?.id]);

  if (loading) return <LoadingSkeleton variant="hero" />;
  if (!movie) return <div className="text-white pt-32 px-12">Movie not found</div>;

  const isAdded = isInWatchlist(movie.id);
  const trailer = movie.videos?.results.find((v) => v.type === 'Trailer' && v.site === 'YouTube');
  const cast = movie.credits?.cast.slice(0, 8) || [];

  const handleAffiliateClick = async (platform: 'amazon' | 'netflix' | 'apple') => {
    // Tracking
    await analytics.trackAffiliateClick({
      user_id: user?.id || null,
      movie_id: movie.id,
      platform
    });

    const query = encodeURIComponent(movie.title);
    let baseUrl = '';

    if (platform === 'amazon') baseUrl = affiliateConfig.amazon_base || 'https://www.amazon.com/s?k=';
    if (platform === 'netflix') baseUrl = affiliateConfig.netflix_base || 'https://www.netflix.com/search?q=';
    if (platform === 'apple') baseUrl = affiliateConfig.apple_base || 'https://tv.apple.com/search?term=';

    window.open(`${baseUrl}${query}`, '_blank');
  };

  return (
    <div className="pb-20">
      {/* Hero Header */}
      <div className="relative w-full h-[70vh] md:h-[90vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={tmdb.getBackdropUrl(movie.backdrop_path, 'original')}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-dark via-transparent to-transparent" />
        </div>

        <div className="relative h-full flex flex-col justify-end px-4 md:px-12 pb-16 max-w-7xl mx-auto">
          <Link to="/" className="absolute top-24 left-4 md:left-12 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-end md:items-start">
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={tmdb.getPosterUrl(movie.poster_path)}
              alt={movie.title}
              className="w-48 md:w-80 rounded-xl shadow-2xl border border-white/10 hidden md:block"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 space-y-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                {movie.genres.map((g) => (
                  <span key={g.id} className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-zinc-200">
                    {g.name}
                  </span>
                ))}
              </div>

              <h1 className="text-4xl md:text-7xl font-display font-black text-white leading-tight uppercase">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-sm md:text-base font-medium">
                <div className="flex items-center gap-2 text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-lg">{movie.vote_average.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Clock className="w-5 h-5" />
                  {movie.runtime} min
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Calendar className="w-5 h-5" />
                  {movie.release_date}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                {trailer && (
                  <Button size="lg" className="gap-2" onClick={() => document.getElementById('trailer')?.scrollIntoView({ behavior: 'smooth' })}>
                    <Play className="w-6 h-6 fill-current" />
                    Watch Trailer
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="lg"
                  className={cn("gap-2 border border-white/10", isAdded && "text-brand-primary")}
                  onClick={() => isAdded ? removeFromWatchlist(movie.id) : addToWatchlist(movie)}
                >
                  <Plus className={cn("w-6 h-6 transition-transform", isAdded && "rotate-45")} />
                  {isAdded ? 'In Watchlist' : 'Add to Watchlist'}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-16 space-y-24">
        {/* Overview */}
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-display font-bold text-white mb-4 uppercase tracking-wider">Overview</h2>
              <p className="text-zinc-400 text-lg leading-relaxed">{movie.overview}</p>
            </div>

            {/* Trailer */}
            {trailer && (
              <div id="trailer" className="space-y-4">
                <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider">Official Trailer</h2>
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer.key}?autoplay=0`}
                    title="YouTube video player"
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Cast */}
            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider">Top Cast</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {cast.map((person) => (
                  <div key={person.id} className="group">
                    <div className="aspect-[4/5] rounded-xl overflow-hidden mb-2 border border-white/5 bg-zinc-900">
                      <img
                        src={tmdb.getPosterUrl(person.profile_path)}
                        alt={person.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    </div>
                    <h4 className="text-white font-semibold text-sm line-clamp-1">{person.name}</h4>
                    <p className="text-zinc-500 text-xs line-clamp-1">{person.character}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar / Affiliate */}
          <div className="space-y-8">
            <div className="glass p-8 rounded-2xl border border-white/10 space-y-6">
              <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider">Watch Now</h3>
              <p className="text-sm text-zinc-400">Stream or buy this movie on your favorite platforms.</p>
              
              <div className="space-y-3">
                <Button variant="secondary" className="w-full justify-between hover:bg-white/20 transition-all group" onClick={() => handleAffiliateClick('amazon')}>
                  <span className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold text-blue-400">AMZ</div>
                    Amazon Prime
                  </span>
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
                <Button variant="secondary" className="w-full justify-between hover:bg-white/20 transition-all group" onClick={() => handleAffiliateClick('netflix')}>
                  <span className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold text-red-600">N</div>
                    Netflix
                  </span>
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
                <Button variant="secondary" className="w-full justify-between hover:bg-white/20 transition-all group" onClick={() => handleAffiliateClick('apple')}>
                  <span className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">TV</div>
                    Apple TV+
                  </span>
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </div>
            </div>

            <div className="bg-brand-primary/10 p-6 rounded-2xl border border-brand-primary/20">
              <h4 className="text-brand-primary font-bold mb-2">Movie Fact</h4>
              <p className="text-zinc-300 text-sm italic">
                "{movie.tagline || 'Experience the cinema like never before.'}"
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="pt-12 border-t border-white/5">
          <ReviewSection movieId={movie.id} />
        </div>

        {/* Similar Movies */}
        <MovieRow title="More Like This" movies={similar} className="px-0 md:px-0" />
      </div>
    </div>
  );
}
