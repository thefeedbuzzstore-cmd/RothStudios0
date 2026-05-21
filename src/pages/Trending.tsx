/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { tmdb } from '../services/tmdb';
import { Movie } from '../types';
import { MovieCard } from '../components/MovieCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { SEO } from '../components/SEO';
import { schemaBuilders } from '../lib/seo';

export default function Trending() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTvShows] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        const [moviesData, tvData] = await Promise.all([
          tmdb.getTrendingMovies(),
          tmdb.getTrendingTvShows()
        ]);
        setMovies(moviesData);
        setTvShows(tvData);
      } catch (error) {
        console.error('Error fetching trending page:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrendingData();
  }, []);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://rothstudios.com';
  
  // SEO Schema
  const breadcrumbSchema = schemaBuilders.buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Trending', url: '/trending' }
  ], origin);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'What movies are trending this week on RothStudios?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'The most popular movies trending this week include box-office hits, major critically acclaimed releases, and streaming blockbusters loaded straight from our movie search databases.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How often is the trending list updated?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'The trending system on RothStudios is updated daily using global search indexes, viewer ratings, on-demand streaming parameters, and user watchlists.'
        }
      }
    ]
  };

  if (loading) {
    return (
      <div className="pt-28 max-w-7xl mx-auto px-4 md:px-12 space-y-12 pb-20">
        <LoadingSkeleton variant="row" />
        <LoadingSkeleton variant="row" />
      </div>
    );
  }

  return (
    <div className="pt-28 max-w-7xl mx-auto px-4 md:px-12 pb-20 space-y-12">
      <SEO 
        title="Trending Movies & Series | RothStudios"
        description="Stay ahead with currently trending movies and TV series on RothStudios. Stream box-office hits, discover new episodes, read reviews, and share watchlists."
        canonicalPath="/trending"
        ogType="website"
        schemas={[breadcrumbSchema, faqSchema]}
      />

      <div className="space-y-4">
        <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight uppercase border-l-4 border-brand-primary pl-4">
          Trending Movies &amp; Series
        </h1>
        <p className="text-zinc-400 text-sm md:text-base max-w-3xl leading-relaxed">
          The ultimate entertainment list showing real-time, high-engagement titles streamed on RothStudios. Discover trending hits, check rating guidelines, and start watching.
        </p>
      </div>

      {/* Movies section */}
      <section className="space-y-6">
        <h2 className="text-xl md:text-2xl font-display font-bold text-white uppercase tracking-wider">
          Trending Blockbusters This Week
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map(movie => (
            <MovieCard key={`movie-${movie.id}`} movie={movie} />
          ))}
        </div>
      </section>

      {/* TV section */}
      <section className="space-y-6 pt-8">
        <h2 className="text-xl md:text-2xl font-display font-bold text-white uppercase tracking-wider">
          Trending TV Series &amp; Shows
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {tvShows.map(series => (
            <MovieCard key={`tv-${series.id}`} movie={series} />
          ))}
        </div>
      </section>
    </div>
  );
}
