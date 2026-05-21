/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tmdb } from '../services/tmdb';
import { Movie } from '../types';
import { MovieCard } from '../components/MovieCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { SEO } from '../components/SEO';
import { schemaBuilders, getCategorySeoDescription } from '../lib/seo';
import { ArrowLeft } from 'lucide-react';

const GENRE_MAP: Record<string, { id: number; name: string }> = {
  'action': { id: 28, name: 'Action' },
  'adventure': { id: 12, name: 'Adventure' },
  'animation': { id: 16, name: 'Animation' },
  'comedy': { id: 35, name: 'Comedy' },
  'crime': { id: 80, name: 'Crime' },
  'documentary': { id: 99, name: 'Documentary' },
  'drama': { id: 18, name: 'Drama' },
  'family': { id: 10751, name: 'Family' },
  'fantasy': { id: 14, name: 'Fantasy' },
  'history': { id: 36, name: 'History' },
  'horror': { id: 27, name: 'Horror' },
  'music': { id: 10402, name: 'Music' },
  'mystery': { id: 9648, name: 'Mystery' },
  'romance': { id: 10749, name: 'Romance' },
  'sci-fi': { id: 878, name: 'Science Fiction' },
  'scifi': { id: 878, name: 'Science Fiction' },
  'thriller': { id: 53, name: 'Thriller' },
  'war': { id: 10752, name: 'War' },
  'western': { id: 37, name: 'Western' }
};

export default function GenrePage() {
  const { genreSlug } = useParams<{ genreSlug: string }>();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const slug = (genreSlug || '').toLowerCase();
  const genreMeta = GENRE_MAP[slug] || { id: 28, name: slug || 'Featured' };

  useEffect(() => {
    const fetchGenreMovies = async () => {
      setLoading(true);
      try {
        const data = await tmdb.getMoviesByGenre(genreMeta.id);
        setMovies(data);
      } catch (error) {
        console.error('Error loading genre page:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGenreMovies();
  }, [slug]);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://rothstudios.com';
  
  // Custom SEO description & Breadcrumb
  const seoDescription = getCategorySeoDescription(slug);
  const breadcrumbSchema = schemaBuilders.buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: genreMeta.name, url: `/genre/${slug}` }
  ], origin);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': `How does RothStudios rank the Best ${genreMeta.name} Movies?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `We rank ${genreMeta.name} movies based on international voter score weightings from high-quality community reviews, cast prominence, and editor recommendations on RothStudios.`
        }
      },
      {
        '@type': 'Question',
        'name': `Are these ${genreMeta.name} movies legal to watch?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `RothStudios lists trailer reviews, ratings, and canonical partner links to legal subscription providers like Amazon, Netflix, and Apple TV to watch the full products.`
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
        title={`Best ${genreMeta.name} Movies &amp; TV Series | RothStudios`}
        description={seoDescription}
        canonicalPath={`/genre/${slug}`}
        ogType="website"
        schemas={[breadcrumbSchema, faqSchema]}
      />

      <div className="space-y-4">
        <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group mb-4 text-sm font-medium">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
        <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight uppercase border-l-4 border-brand-primary pl-4">
          Best {genreMeta.name} Releases
        </h1>
        <p className="text-zinc-400 text-sm md:text-base max-w-3xl leading-relaxed">
          {seoDescription} Check star ratings, synopsis reports, trailers, cast lists, and write reviews.
        </p>
      </div>

      <section className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
        {movies.length === 0 && (
          <div className="text-center py-20 text-zinc-500 font-medium">
            No movies found in this category. Check back later!
          </div>
        )}
      </section>
    </div>
  );
}
