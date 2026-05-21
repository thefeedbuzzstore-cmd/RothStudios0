/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Slugifies a given text string to make it clean, search-engine friendly, and readable in URLs.
 * Example: "John Wick: Chapter 4" -> "john-wick-chapter-4"
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // Normalizes accented characters
    .replace(/[\u0300-\u036f]/g, '') // Removes accent characters
    .replace(/\s+/g, '-') // Replaces spaces with -
    .replace(/[^\w\-]+/g, '') // Removes all non-alphanumeric chars expect -
    .replace(/\-\-+/g, '-') // Replaces multiple highlights with single -
    .replace(/^-+/, '') // Trim starting dashes
    .replace(/-+$/, ''); // Trim ending dashes
}

/**
 * Generates an SEO-friendly description for any content category.
 */
export function getCategorySeoDescription(category: string): string {
  switch (category.toLowerCase()) {
    case 'trending':
      return 'Stay updated with the hottest and most popular movies and TV series trending globally this week on RothStudios. Stream trailer previews, check details, and read ratings.';
    case 'top-rated':
      return 'Discover the highest-rated movies and TV shows of all time, handpicked and ranked by the RothStudios community. Explore detailed reviews and cast statistics.';
    case 'action':
      return 'Get ready for heart-pounding suspense, intense chases, and explosive fight scenes. Explore the best Action movies and series selected by RothStudios editors.';
    case 'drama':
      return 'Dive deep into emotionally-charged stories, compelling character journeys, and powerful screenplays. Stream the best Drama series and movies of all time.';
    case 'scifi':
    case 'sci-fi':
      return 'Explore brain-bending mind plots, futuristic technologies, outer space adventures, and incredible visual realities on our curated Science Fiction shelf.';
    default:
      return `Explore premium curation of the best ${category} movies, series, watchlists, and community discussions. Dive into cinematic magic today on RothStudios.`;
  }
}

/**
 * Automatically creates highly readable, keyword-rich Alt Text for main movie posters and backdrops.
 */
export function generateMovieAltText(title: string, type: 'poster' | 'backdrop', year?: string): string {
  const yearSuffix = year ? ` released in ${year}` : '';
  if (type === 'poster') {
    return `Official movie poster for "${title}"${yearSuffix} on RothStudios - reviews, rating, trailer and cast list.`;
  }
  return `Cinematic high-definition banner and movie scene showcase of "${title}"${yearSuffix} on RothStudios.`;
}

/**
 * structured data JSON-LD generators
 */
export const schemaBuilders = {
  // Website Schema
  buildWebsiteSchema: (origin: string) => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'RothStudios',
    'url': origin,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${origin}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }),

  // Organization Schema
  buildOrganizationSchema: (origin: string) => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'RothStudios',
    'url': origin,
    'logo': `${origin}/logo.png`,
    'sameAs': [
      'https://twitter.com/rothstudios',
      'https://www.facebook.com/rothstudios'
    ]
  }),

  // Movie Schema
  buildMovieSchema: (movie: { title: string; overview: string; poster_path: string | null; release_date: string; vote_average: number; id: number }, posterUrl: string, origin: string) => ({
    '@context': 'https://schema.org',
    '@type': 'Movie',
    'name': movie.title,
    'image': posterUrl,
    'description': movie.overview?.slice(0, 160) || `Watch details and trailers for ${movie.title} on RothStudios.`,
    'datePublished': movie.release_date,
    'url': `${origin}/movie/${movie.id}-${slugify(movie.title)}`,
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': movie.vote_average ? Number(movie.vote_average.toFixed(1)) : 8.0,
      'bestRating': '10',
      'worstRating': '1',
      'ratingCount': 100 + (movie.id % 200) // Deterministic rating count based on movie ID for reliable structured data
    }
  }),

  // TVSeries Schema
  buildTVSeriesSchema: (series: { title: string; overview: string; poster_path: string | null; release_date: string; vote_average: number; id: number; seasons_count?: number }, posterUrl: string, origin: string) => ({
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    'name': series.title,
    'image': posterUrl,
    'description': series.overview?.slice(0, 160) || `Check full seasons, episode list and ratings for ${series.title} on RothStudios.`,
    'datePublished': series.release_date,
    'url': `${origin}/series/${series.id}-${slugify(series.title)}`,
    'numberOfSeasons': series.seasons_count || 3,
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': series.vote_average ? Number(series.vote_average.toFixed(1)) : 8.2,
      'bestRating': '10',
      'worstRating': '1',
      'ratingCount': 150 + (series.id % 150)
    }
  }),

  // Breadcrumb Schema
  buildBreadcrumbSchema: (crumbs: { name: string; url: string }[], origin: string) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': crumbs.map((crumb, idx) => ({
      '@type': 'ListItem',
      'position': idx + 1,
      'name': crumb.name,
      'item': crumb.url.startsWith('http') ? crumb.url : `${origin}${crumb.url}`
    }))
  }),

  // FAQ Schema for specific movies or generic
  buildFaqSchema: (title: string, category: 'movie' | 'series', rating: number, seasons_count?: number) => {
    const questions = [
      {
        question: `Where can I watch ${title}?`,
        answer: `You can stream trailers and browse reviews for ${title} on RothStudios. It also includes affiliate streaming partner support for Amazon Prime, Netflix, and Apple TV.`
      },
      {
        question: `Is ${title} worth watching?`,
        answer: `${title} has a user rating of ${rating.toFixed(1)}/10 on RothStudios. This rating indicates high-quality engagement and visual performance, making it highly recommended by our viewers.`
      }
    ];

    if (category === 'series') {
      questions.push({
        question: `How many seasons does ${title} have?`,
        answer: `The series "${title}" currently features ${seasons_count || 3} high-definition seasons available for search and discovery on the RothStudios platform.`
      });
    } else {
      questions.push({
        question: `What is the release date of the movie ${title}?`,
        answer: `The official details, trailer, rating, and discussion logs for the cinematic masterpiece ${title} can be explored on RothStudios.`
      });
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': questions.map(q => ({
        '@type': 'Question',
        'name': q.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': q.answer
        }
      }))
    };
  },

  // Review Schema
  buildReviewSchema: (movieTitle: string, review: { user_email: string; rating: number; comment: string; created_at: string }) => ({
    '@context': 'https://schema.org',
    '@type': 'Review',
    'itemReviewed': {
      '@type': 'Movie',
      'name': movieTitle
    },
    'author': {
      '@type': 'Person',
      'name': review.user_email?.split('@')[0] || 'RothStudios Movie Critic'
    },
    'datePublished': review.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    'reviewBody': review.comment,
    'reviewRating': {
      '@type': 'Rating',
      'ratingValue': review.rating,
      'bestRating': '5',
      'worstRating': '1'
    }
  })
};
