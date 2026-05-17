import { supabase } from '../lib/supabase';
import { AnalyticsEvent, AffiliateClick } from '../types';

export const analytics = {
  trackEvent: async (event: Omit<AnalyticsEvent, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert(event);
      
      if (error) console.error('Error tracking event:', error);
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
  }
};
