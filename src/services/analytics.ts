/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from '../lib/supabase';
import { AnalyticsEvent, AffiliateClick } from '../types';

// Declare global window properties for Google Analytics gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const analytics = {
  /**
   * Initializes Google Analytics (gtag.js) dynamically
   * Uses standard Measurement ID, fallback-safe
   */
  initGoogleAnalytics: (measurementId: string = 'G-ROTHSTUDIOS') => {
    if (typeof window === 'undefined') return;
    
    // Inject the Google Analytics tag script dynamically in document head
    try {
      const scriptId = 'google-analytics-script';
      if (document.getElementById(scriptId)) return;

      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
      
      window.gtag('js', new Date());
      window.gtag('config', measurementId, {
        page_path: window.location.pathname,
        cookie_flags: 'max-age=86400;secure;samesite=none' // iframe compliant security flags
      });
      
      console.log('Google Analytics tag G-ROTHSTUDIOS integrated successfully.');
    } catch (err) {
      console.error('Google Analytics initializer error:', err);
    }
  },

  /**
   * Tracks standard page views dynamically in GA and Supabase
   */
  trackPageView: (pathname: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: pathname,
        page_title: document.title
      });
    }
  },

  trackEvent: async (event: Omit<AnalyticsEvent, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert(event);
      
      if (error) console.error('Error tracking event:', error);
      
      // Mirror to Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', event.event_type, event.metadata || {});
      }
    } catch (err) {
      console.error('Unexpected error tracking event:', err);
    }
  },

  trackAffiliateClick: async (click: Omit<AffiliateClick, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('affiliate_clicks')
        .insert(click);

      if (error) console.error('Error tracking affiliate click:', error);
      
      // Also track as a general event
      await analytics.trackEvent({
        event_type: 'click',
        user_id: click.user_id,
        movie_id: click.movie_id,
        metadata: { platform: click.platform }
      });
    } catch (err) {
      console.error('Unexpected error tracking affiliate click:', err);
    }
  },

  /**
   * Standard tracker for SEO search behaviors
   */
  trackSearchBehavior: async (userId: string | null, query: string, resultCount: number) => {
    await analytics.trackEvent({
      event_type: 'search',
      user_id: userId,
      metadata: { 
        search_query: query, 
        results_returned: resultCount,
        device_type: typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop'
      }
    });
  }
};
