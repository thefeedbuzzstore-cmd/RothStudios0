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

export default function TopRated() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopRatedData = async () => {
      try {
        const data = await tmdb.getTopRatedMovies();
        setMovies(data);
      } catch (error) {
        console.error('Error fetching top rated page:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopRatedData();
  }, []);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://rothstudios.com';
  
  // SEO Schema
  const breadcrumbSchema = schemaBuilders.buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Top Rated', url: '/top-rated' }
  ], origin);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'What is the highest-rated movie on RothStudios?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'The highest-rated films are cinematic legends like The Shawshank Redemption, The Godfather, and critically acclaimed blockbusters, rated and audited by hundreds of thousands of registered cinephiles worldwide.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How is the top-rated algorithm calculated?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'We calculate top ratings using a weighted community voter average together with critic standards. This protects ratings from duplicate entry spams.'
        }
      }
    ]
  };

  if (loading) {
    return (
      <div className="pt-28 max-w-7xl mx-auto px-4 md:px-12 space-y-12 pb-20">
        <LoadingSkeleton variant="row" />
      </div>
    );
  }

  return (
    <div className="pt-28 max-w-7xl mx-auto px-4 md:px-12 pb-20 space-y-12">
      <SEO 
        title="Top Rated Movies &amp; Series of All Time | RothStudios"
        description="Explore the best movies and TV shows of all time, rated by the global community. Browse classic titles, read in-depth customer reviews and check scores."
        canonicalPath="/top-rated"
        ogType="website"
        schemas={[breadcrumbSchema, faqSchema]}
      />

      <div className="space-y-4">
        <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight uppercase border-l-4 border-brand-primary pl-4">
          Top Rated Masterpieces
        </h1>
        <p className="text-zinc-400 text-sm md:text-base max-w-3xl leading-relaxed">
          Welcome to the absolute hall of fame. This catalog contains only content carrying premium scores and verified community and editor reviews.
        </p>
      </div>

      <section className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
}
