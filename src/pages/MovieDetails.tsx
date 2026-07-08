/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, Play, Plus, Clock, Calendar, ExternalLink, ArrowLeft, Share2, Copy, Check, Tv, Film, Sparkles } from 'lucide-react';
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
import { SEO } from '../components/SEO';
import { schemaBuilders, generateMovieAltText } from '../lib/seo';

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [movie, setMovie] = useState<any | null>(null);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [affiliateConfig, setAffiliateConfig] = useState<any>({});
  const [copied, setCopied] = useState(false);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { user } = useAuth();

  const isSeries = location.pathname.startsWith('/series');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      window.scrollTo(0, 0);

      try {
        let actualId = id;
        
        // Handle Clean Slug: If id is not a raw numeric sequence (e.g. "interstellar" or "breaking-bad"), resolve it!
        const parsedId = parseInt(id.split('-')[0], 10);
        if (isNaN(parsedId)) {
          const query = id.replace(/-/g, ' ');
          if (isSeries) {
            const results = await tmdb.searchTV(query);
            if (results && results.length > 0) {
              actualId = String(results[0].id);
            }
          } else {
            const results = await tmdb.searchMovies(query);
            if (results && results.length > 0) {
              actualId = String(results[0].id);
            }
          }
        } else {
          // It starts with a number, e.g. "550-fight-club" -> extract "550"
          actualId = String(parsedId);
        }

        // Parallel TMDB & Supabase loads
        // Safe helpers so that if Supabase is unconfigured, has bad credentials, or fails, the page still loads perfectly
        const fetchConfigSafe = async () => {
          try {
            const url = import.meta.env.VITE_SUPABASE_URL;
            if (!url || url.includes('placeholder')) return [];
            const { data, error } = await supabase.from('config').select('*');
            if (error) throw error;
            return data || [];
          } catch (err) {
            console.warn('Unable to load Supabase configuration, using local fallbacks:', err);
            return [];
          }
        };

        const fetchReviewsSafe = async () => {
          try {
            const url = import.meta.env.VITE_SUPABASE_URL;
            if (!url || url.includes('placeholder')) return [];
            const { data, error } = await supabase
              .from('movie_reviews')
              .select('*')
              .eq('movie_id', Number(actualId))
              .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
          } catch (err) {
            console.warn('Unable to load reviews from Supabase:', err);
            return [];
          }
        };

        const [movieData, similarData, configData, reviewData] = await Promise.all([
          isSeries ? tmdb.getTVDetails(actualId) : tmdb.getMovieDetails(actualId),
          isSeries ? tmdb.getSimilarTV(actualId) : tmdb.getSimilarMovies(actualId),
          fetchConfigSafe(),
          fetchReviewsSafe()
        ]);

        setMovie(movieData);
        setSimilar(similarData || []);
        setReviews(reviewData || []);

        // Convert config array to map
        const configMap = (configData || []).reduce((acc, curr) => ({
          ...acc, [curr.key]: curr.value
        }), {});

        // Overwrite or populate with any custom values stored in localStorage
        const localKeys = [
          'netflix_base', 
          'amazon_base', 
          'apple_base', 
          'custom_affiliate_name', 
          'custom_affiliate_base', 
          'custom_affiliate_enabled', 
          'affiliate_enabled'
        ];
        localKeys.forEach(lk => {
          const localValRaw = localStorage.getItem(`config_${lk}`);
          if (localValRaw !== null) {
            try {
              configMap[lk] = JSON.parse(localValRaw);
            } catch {
              configMap[lk] = localValRaw;
            }
          }
        });

        setAffiliateConfig(configMap);

        // Track view trigger for analytics database
        analytics.trackEvent({
          event_type: 'view',
          user_id: user?.id || null,
          movie_id: Number(actualId),
          metadata: { title: movieData.title, isSeries }
        });

      } catch (error) {
        console.error('Error fetching Movie/TV details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user?.id, isSeries]);

  if (loading) return <LoadingSkeleton variant="hero" />;
  if (!movie) {
    return (
      <div className="text-center py-40 max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-white mb-4">Content Not Found</h2>
        <p className="text-zinc-500 mb-8 font-medium">The requested movie or TV series slug could not be located in our systems.</p>
        <Button variant="brand" asChild>
          <Link to="/">Back to Safe Space</Link>
        </Button>
      </div>
    );
  }

  const isAdded = isInWatchlist(movie.id);
  const trailer = movie.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
  const cast = movie.credits?.cast?.slice(0, 8) || [];
  const releaseYear = movie.release_date?.split('-')?.[0] || '2026';

  const handleAffiliateClick = async (platform: 'amazon' | 'netflix' | 'apple' | 'custom') => {
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
    if (platform === 'custom') baseUrl = affiliateConfig.custom_affiliate_base || 'https://thefeedbuzz.store/search?q=';

    // For custom platform, go directly to the configured website verbatim as requested
    let targetUrl = platform === 'custom' ? baseUrl : `${baseUrl}${query}`;

    // Ensure the target URL starts with a protocol scheme (http:// or https://)
    // so the browser opens it as an absolute external link rather than a relative path
    const trimmedTarget = targetUrl.trim();
    if (trimmedTarget && !/^https?:\/\//i.test(trimmedTarget) && !/^\/\//.test(trimmedTarget)) {
      targetUrl = `https://${trimmedTarget}`;
    }

    window.open(targetUrl, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // SEO Helpers & Schema builders
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://rothstudios.com';
  const canonicalPath = isSeries ? `/series/${movie.id}-${id}` : `/movie/${movie.id}-${id}`;
  const posterUrl = tmdb.getPosterUrl(movie.poster_path, 'w500');

  // Page title dynamic generation
  const pageTitle = isSeries 
    ? `${movie.title} – Episodes, Seasons & Reviews | RothStudios`
    : `${movie.title} – Trailer, Cast, Rating & Details | RothStudios`;

  const metaDescription = `${movie.overview?.slice(0, 140)}... Discover ${movie.title} trailers, official community rating score, cast roster, and similar options on RothStudios.`;

  // Structured definitions maps
  const breadcrumbs = schemaBuilders.buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: isSeries ? 'Series' : 'Movies', url: isSeries ? '/trending' : '/' },
    { name: movie.title, url: canonicalPath }
  ], origin);

  const mainItemSchema = isSeries
    ? schemaBuilders.buildTVSeriesSchema(movie, posterUrl, origin)
    : schemaBuilders.buildMovieSchema(movie, posterUrl, origin);

  const faqListSchema = schemaBuilders.buildFaqSchema(movie.title, isSeries ? 'series' : 'movie', movie.vote_average, movie.number_of_seasons);

  // Review schemas list from Supabase Reviews data
  const reviewSchemas = reviews.slice(0, 3).map(rev => schemaBuilders.buildReviewSchema(movie.title, rev));

  return (
    <div className="pb-20">
      {/* Structural Schema and Meta Controllers */}
      <SEO 
        title={pageTitle}
        description={metaDescription}
        canonicalPath={canonicalPath}
        ogType={isSeries ? 'video.tv_show' : 'video.movie'}
        ogImage={tmdb.getBackdropUrl(movie.backdrop_path, 'original')}
        schemas={[breadcrumbs, mainItemSchema, faqListSchema, ...reviewSchemas]}
      />

      {/* Hero Header Banner */}
      <div className="relative w-full h-[70vh] md:h-[90vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={tmdb.getBackdropUrl(movie.backdrop_path, 'w1280')}
            alt={generateMovieAltText(movie.title, 'backdrop', releaseYear)}
            className="w-full h-full object-cover"
            loading="eager" // Preload backdrop for outstanding Core Web Vitals (LCP) performance optimization
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-dark via-transparent to-transparent" />
        </div>

        <div className="relative h-full flex flex-col justify-end px-4 md:px-12 pb-16 max-w-7xl mx-auto">
          <Link to="/" className="absolute top-24 left-4 md:left-12 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group z-20">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-end md:items-start z-10 w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="w-48 md:w-80 flex-shrink-0 hidden md:block"
            >
              <img
                src={posterUrl}
                alt={generateMovieAltText(movie.title, 'poster', releaseYear)}
                className="rounded-xl shadow-2xl border border-white/10 w-full"
                loading="lazy"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 space-y-6 w-full text-left"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-brand-primary/20 text-brand-primary rounded-full text-xs font-semibold uppercase tracking-wider">
                  {isSeries ? <Tv className="w-3.5 h-3.5" /> : <Film className="w-3.5 h-3.5" />}
                  {isSeries ? 'TV Series' : 'Movie'}
                </span>
                {(movie.genres || []).map((g: any) => (
                  <span key={g.id} className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-zinc-200">
                    {g.name}
                  </span>
                ))}
              </div>

              <h1 className="text-4xl md:text-7xl font-display font-black text-white leading-tight uppercase tracking-tight">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-sm md:text-base font-medium">
                <div className="flex items-center gap-2 text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-lg font-bold">{movie.vote_average?.toFixed(1) || '8.0'}</span>
                </div>
                {movie.runtime && (
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Clock className="w-5 h-5" />
                    {movie.runtime} min
                  </div>
                )}
                {movie.release_date && (
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Calendar className="w-5 h-5" />
                    {movie.release_date}
                  </div>
                )}
              </div>

              {/* Action and Engagement Controllers */}
              <div className="flex flex-wrap gap-4 pt-4">
                {trailer && (
                  <Button size="lg" className="gap-2 shrink-0" onClick={() => document.getElementById('trailer')?.scrollIntoView({ behavior: 'smooth' })}>
                    <Play className="w-6 h-6 fill-current" />
                    Watch Trailer
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="lg"
                  className={cn("gap-2 border border-white/10 shrink-0", isAdded && "text-brand-primary")}
                  onClick={() => isAdded ? removeFromWatchlist(movie.id) : addToWatchlist(movie)}
                >
                  <Plus className={cn("w-6 h-6 transition-transform", isAdded && "rotate-45")} />
                  {isAdded ? 'In Watchlist' : 'Add to Watchlist'}
                </Button>

                {/* Social sharing and copying panels */}
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-2 h-12">
                  <button 
                    onClick={handleCopyLink} 
                    className="p-2.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors active:scale-90"
                    title="Copy URL"
                    aria-label="Copy movie page link to clipboard"
                  >
                    {copied ? <Check className="w-5 h-5 text-brand-primary" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <a 
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Checkout ${movie.title} - ${window.location.href}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                    title="Share on Twitter"
                    aria-label="Share this movie on Twitter"
                  >
                    <Share2 className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-16 space-y-24 text-left">
        <div className="grid md:grid-cols-3 gap-12">
          
          <div className="md:col-span-2 space-y-12">
            
            {/* Overview text */}
            <div>
              <h2 className="text-2xl font-display font-bold text-white mb-4 uppercase tracking-wider">Overview</h2>
              <p className="text-zinc-400 text-lg leading-relaxed">{movie.overview}</p>
            </div>

            {/* SEASONS & EPISODES (Only rendered for TV Shows) */}
            {isSeries && movie.seasons && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider">Seasons &amp; Episodes</h2>
                  <span className="text-sm font-bold text-brand-primary">
                    {movie.number_of_seasons} Seasons Total • {movie.number_of_episodes} Episodes
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {movie.seasons.filter((s: any) => s.season_number > 0).map((season: any) => (
                    <div key={season.id} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="w-20 bg-zinc-800 rounded-lg overflow-hidden shrink-0 aspect-[2/3]">
                        <img 
                          src={tmdb.getPosterUrl(season.poster_path)} 
                          alt={season.name} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="space-y-1.5 flex flex-col justify-center">
                        <h4 className="text-white font-bold text-base">{season.name}</h4>
                        <p className="text-xs text-brand-primary font-bold uppercase tracking-wider">{season.episode_count} Episodes</p>
                        <p className="text-xs text-zinc-500 line-clamp-2">{season.overview || 'No overview available for this season.'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trailer video container */}
            {trailer && (
              <div id="trailer" className="space-y-4">
                <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider">Official Trailer</h2>
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer.key}?autoplay=0`}
                    title={`Official HD trailer for ${movie.title}`}
                    className="w-full h-full"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {/* Cast members grid */}
            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider">Top Cast</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {cast.map((person: any) => (
                  <div key={person.id} className="group">
                    <div className="aspect-[4/5] rounded-xl overflow-hidden mb-2 border border-white/5 bg-zinc-900">
                      <img
                        src={tmdb.getPosterUrl(person.profile_path)}
                        alt={person.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        loading="lazy"
                      />
                    </div>
                    <h4 className="text-white font-semibold text-sm line-clamp-1">{person.name}</h4>
                    <p className="text-zinc-500 text-xs line-clamp-1">{person.character}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar / streaming routes / fun facts */}
          <div className="space-y-8">
            <div className="glass p-8 rounded-2xl border border-white/10 space-y-6">
              <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider">Watch Now</h3>
              <p className="text-sm text-zinc-400">Stream or buy this cinematic directly from legal on-demand suppliers.</p>
              
              <div className="space-y-3">
                {(affiliateConfig.affiliate_enabled !== false && affiliateConfig.affiliate_enabled !== 'false') && (
                  <>
                    {(affiliateConfig.custom_affiliate_enabled === true || affiliateConfig.custom_affiliate_enabled === 'true' || affiliateConfig.custom_affiliate_enabled === undefined) && (
                      <Button variant="secondary" className="w-full justify-between hover:bg-white/20 transition-all group border border-brand-primary/20 bg-brand-primary/5" onClick={() => handleAffiliateClick('custom')}>
                        <span className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-brand-primary/10 flex items-center justify-center text-xs font-black text-brand-primary">
                            {(affiliateConfig.custom_affiliate_name || 'The Feed Buzz').slice(0, 3).toUpperCase()}
                          </div>
                          <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                            {affiliateConfig.custom_affiliate_name || 'The Feed Buzz'}
                            <Sparkles className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
                          </span>
                        </span>
                        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Button>
                    )}
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
                  </>
                )}
                {(affiliateConfig.affiliate_enabled === false || affiliateConfig.affiliate_enabled === 'false') && (
                  <div className="text-zinc-500 text-xs py-4 text-center italic">
                    Affiliate platforms are temporarily disabled.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-brand-primary/10 p-6 rounded-2xl border border-brand-primary/20">
              <h4 className="text-brand-primary font-bold mb-2">Platform Tagline</h4>
              <p className="text-zinc-300 text-sm italic">
                "{movie.tagline || 'Experience the heights of cinema directly on RothStudios.'}"
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic FAQ lists block */}
        <div className="pt-12 border-t border-white/5">
          <h3 className="text-xl md:text-2xl font-display font-bold text-white uppercase tracking-wider mb-6">Frequently Asked Questions (FAQ)</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/5 p-6 rounded-2xl space-y-2">
              <h4 className="text-white font-bold text-base">Q: Where can I watch {movie.title}?</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">You can stream trailers and browse reviews for {movie.title} on RothStudios. Our sidebar contains affiliate link shortcuts connecting directly to legal on-demand platforms such as Amazon Prime, Netflix, and Apple TV+.</p>
            </div>
            <div className="bg-white/5 border border-white/5 p-6 rounded-2xl space-y-2">
              <h4 className="text-white font-bold text-base">Q: Is {movie.title} worth watching?</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">{movie.title} carries an aggregate database score of {movie.vote_average?.toFixed(1) || '8.0'}/10. This signals fantastic critical consensus, visual execution, and performance indices, making it highly recommended.</p>
            </div>
            {isSeries && (
              <div className="bg-white/5 border border-white/5 p-6 rounded-2xl space-y-2 col-span-full">
                <h4 className="text-white font-bold text-base">Q: How many seasons does the series {movie.title} have?</h4>
                <p className="text-zinc-400 text-sm leading-relaxed">{movie.title} currently spans {movie.number_of_seasons} authorized seasons, all of which are cataloged and listed with total episode numbers in our Seasons section.</p>
              </div>
            )}
          </div>
        </div>

        {/* User reviews submission and display */}
        <div className="pt-12 border-t border-white/5">
          <ReviewSection movieId={movie.id} />
        </div>

        {/* Dynamic bottom internal link recommendations */}
        <MovieRow title={isSeries ? "People Also Watched" : "More Like This"} movies={similar} className="px-0 md:px-0" />
      </div>
    </div>
  );
}
