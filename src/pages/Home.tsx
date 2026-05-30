/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { tmdb } from '../services/tmdb';
import { Movie } from '../types';
import { HeroSection } from '../components/HeroSection';
import { MovieRow } from '../components/MovieRow';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { SEO } from '../components/SEO';
import { schemaBuilders } from '../lib/seo';

export default function Home() {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingSeries, setTrendingSeries] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [actionMovies, setActionMovies] = useState<Movie[]>([]);
  const [dramaSeries, setDramaSeries] = useState<Movie[]>([]);
  const [editorPicks, setEditorPicks] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        // Step 1: Fetch above the fold content immediately to render the page in milliseconds
        const [
          trendingMoviesData,
          trendingSeriesData,
        ] = await Promise.all([
          tmdb.getTrendingMovies(),
          tmdb.getTrendingTvShows(),
        ]);

        if (!active) return;

        setTrendingMovies(trendingMoviesData);
        setTrendingSeries(trendingSeriesData);
        setLoading(false); // Immediate visual page transition!

        // Step 2: Progressingly fetch other rows in background
        const [
          topRatedData,
          upcomingData,
          popularData,
          actionData,
          dramaData,
        ] = await Promise.all([
          tmdb.getTopRatedMovies(),
          tmdb.getUpcomingMovies(),
          tmdb.getPopularMovies(),
          tmdb.getMoviesByGenre(28), // Action
          tmdb.getMoviesByGenre(18), // Drama
        ]);

        if (!active) return;

        setTopRated(topRatedData);
        setUpcoming(upcomingData);
        setPopular(popularData);
        setActionMovies(actionData);
        setDramaSeries(dramaData);
        
        // Editor Picks are hand-picked premium cinematics from the popular/trending sets
        const picks = [...trendingMoviesData, ...popularData]
          .filter((v, i, self) => self.findIndex(t => t.id === v.id) === i)
          .slice(3, 12);
        setEditorPicks(picks);
      } catch (error) {
        console.error('Error fetching Home cinema groups:', error);
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => {
      active = false;
    };
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

  const heroMovie = trendingMovies[0];
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://rothstudios.com';

  // Build JSON-LD structured schemas for Google Crawler
  const websiteSchema = schemaBuilders.buildWebsiteSchema(origin);
  const organizationSchema = schemaBuilders.buildOrganizationSchema(origin);
  const homeBreadcrumb = schemaBuilders.buildBreadcrumbSchema([
    { name: 'Home', url: '/' }
  ], origin);

  return (
    <div className="pb-20 space-y-12">
      {/* Search Engine Optimization Metadata */}
      <SEO
        title="RothStudios – Discover Movies, TV Series & Trending Entertainment"
        description="Discover top trending movies, seasons, TV series, reviews and on-demand entertainment on RothStudios. Browse cast lists and watch official trailers today!"
        canonicalPath="/"
        ogType="website"
        schemas={[websiteSchema, organizationSchema, homeBreadcrumb]}
      />

      {heroMovie && <HeroSection movie={heroMovie} />}
      
      <div className="relative z-10 -mt-16 md:-mt-32 space-y-16">
        
        {/* Row 1: Trending Movies */}
        <MovieRow 
          title="Trending Movies" 
          description="Explore this week's most searched and viewed theatrical releases on RothStudios. Watch the official trailers, cast lists, ratings, and read user commentary."
          movies={trendingMovies} 
        />

        {/* Row 2: Trending Series */}
        <MovieRow 
          title="Trending Series" 
          description="Discover the highest-performing premium TV shows and multi-season series trending globally. Scroll through episodes, official season releases, and fan analysis."
          movies={trendingSeries} 
        />

        {/* Row 3: Top Rated */}
        <MovieRow 
          title="Top Rated Masterpieces" 
          description="Immerse yourself in critically acclaimed cinematic legends ranked by the RothStudios community. Find the global gold standards of film history here."
          movies={topRated} 
        />

        {/* Row 4: Recently Added */}
        <MovieRow 
          title="Recently Added" 
          description="The newest additions to the RothStudios media database. Keep track of fresh arrivals, indie titles, and modern platform uploads."
          movies={upcoming.slice(0, 8)} 
        />

        {/* Row 5: Upcoming Releases */}
        <MovieRow 
          title="Upcoming Releases" 
          description="A pre-release sneak peek into future blockbusters. Set your calendars, watch early teasers, and read exclusive pre-release synopses."
          movies={upcoming} 
        />

        {/* Row 6: Popular This Week */}
        <MovieRow 
          title="Popular This Week" 
          description="Catch up with films capturing maximum screen-time this week. See what thousands of other cinemaphiles are rating, critiquing, and discussing."
          movies={popular} 
        />

        {/* Row 7: Best Action Movies */}
        <MovieRow 
          title="Best Action Movies" 
          description="Incredible fast-paced tension, tactical warfare, hand-to-hand combat, and car chases. These action-heavy blockbusters offer state-of-the-art adrenaline."
          movies={actionMovies} 
        />

        {/* Row 8: Best Drama Movies & Series */}
        <MovieRow 
          title="Best Drama Series & Films" 
          description="Compelling true-to-life screenplays, complex character struggles, and dramatic family cycles. Explore multi-award winning dramatic masterpieces."
          movies={dramaSeries} 
        />

        {/* Row 9: Editor Picks */}
        <MovieRow 
          title="Editor Picks" 
          description="Hand-selected cinematic masterpieces chosen for screenwriting brilliance, high visual quality, sound engineering, and legendary direction."
          movies={editorPicks} 
        />
        
      </div>
    </div>
  );
}
