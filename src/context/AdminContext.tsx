import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { analytics } from '../services/analytics';
import { useAuth } from './AuthContext';
import { AppConfig } from '../types';

interface AdminContextType {
  users: any[];
  affiliateClicks: any[];
  analyticsEvents: any[];
  movieReviews: any[];
  config: AppConfig[];
  stats: {
    totalUsers: number;
    totalClicks: number;
    totalWatchlist: number;
    totalReviews: number;
    activeSessions: number;
    trends: {
      users: number;
      clicks: number;
      watchlist: number;
      reviews: number;
    };
  };
  isLoading: boolean;
  refreshData: () => Promise<void>;
  updateConfig: (key: string, value: any) => Promise<void>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

const AdminContext = React.createContext<AdminContextType | undefined>(undefined);

import { toast } from 'sonner';

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [affiliateClicks, setAffiliateClicks] = useState<any[]>([]);
  const [analyticsEvents, setAnalyticsEvents] = useState<any[]>([]);
  const [movieReviews, setMovieReviews] = useState<any[]>([]);
  const [config, setConfig] = useState<AppConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async (silent = false) => {
    if (!isAdmin) return;
    if (!silent) setIsLoading(true);
    try {
      const [
        { data: userData },
        { data: clickData },
        { data: eventData },
        { data: reviewData },
        { data: configData }
      ] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('affiliate_clicks').select('*').order('created_at', { ascending: false }),
        supabase.from('analytics_events').select('*').order('created_at', { ascending: false }),
        supabase.from('movie_reviews').select('*').order('created_at', { ascending: false }),
        supabase.from('config').select('*')
      ]);

      setUsers(userData || []);
      setAffiliateClicks(clickData || []);
      setAnalyticsEvents(eventData || []);
      setMovieReviews(reviewData || []);
      setConfig(configData || []);
    } catch (error) {
      console.error('Admin Fetch error:', error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  const updateConfig = async (key: string, value: any) => {
    const promise = Promise.resolve(supabase
      .from('config')
      .upsert({ key, value, updated_at: new Date().toISOString() }));
    
    toast.promise(promise, {
      loading: 'Updating configuration...',
      success: 'Configuration updated successfully',
      error: 'Failed to update configuration'
    });

    try {
      const { error } = await promise;
      if (error) throw error;
      fetchData(true);
    } catch (error) {
      console.error('Update config error:', error);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    const promise = Promise.resolve(supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId));

    toast.promise(promise, {
      loading: `Updating user role to ${role}...`,
      success: `User is now a ${role}`,
      error: 'Failed to update user role'
    });

    try {
      const { error } = await promise;
      if (error) throw error;
      fetchData(true);
    } catch (error) {
      console.error('Update user role error:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    const promise = Promise.resolve(supabase
      .from('profiles')
      .delete()
      .eq('id', userId));

    toast.promise(promise, {
      loading: 'Deleting user...',
      success: 'User deleted successfully',
      error: 'Failed to delete user'
    });

    try {
      const { error } = await promise;
      if (error) throw error;
      fetchData(true);
    } catch (error) {
      console.error('Delete user error:', error);
    }
  };

  const stats = {
    totalUsers: users.length,
    totalClicks: affiliateClicks.length,
    totalWatchlist: analyticsEvents.filter(e => e.event_type === 'watchlist_add').length,
    totalReviews: movieReviews.length,
    activeSessions: Array.from(new Set(
      analyticsEvents
        .filter(e => {
          const eventDate = new Date(e.created_at);
          const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
          return eventDate > thirtyMinsAgo;
        })
        .map(e => e.user_id)
    )).length || 1, // At least 1 (the admin viewing)
    
    // Calculate trends (comparing last 7 days vs previous 7 days)
    trends: {
      users: (() => {
        const last7 = users.filter(u => new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
        const prev7 = users.filter(u => {
          const date = new Date(u.created_at);
          return date < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && date > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        }).length;
        return prev7 === 0 ? (last7 > 0 ? 100 : 0) : Math.round(((last7 - prev7) / prev7) * 100);
      })(),
      clicks: (() => {
        const last7 = affiliateClicks.filter(c => new Date(c.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
        const prev7 = affiliateClicks.filter(c => {
          const date = new Date(c.created_at);
          return date < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && date > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        }).length;
        return prev7 === 0 ? (last7 > 0 ? 100 : 0) : Math.round(((last7 - prev7) / prev7) * 100);
      })(),
      watchlist: (() => {
        const events = analyticsEvents.filter(e => e.event_type === 'watchlist_add');
        const last7 = events.filter(e => new Date(e.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
        const prev7 = events.filter(e => {
          const date = new Date(e.created_at);
          return date < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && date > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        }).length;
        return prev7 === 0 ? (last7 > 0 ? 100 : 0) : Math.round(((last7 - prev7) / prev7) * 100);
      })(),
      reviews: (() => {
        const last7 = movieReviews.filter(r => new Date(r.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
        const prev7 = movieReviews.filter(r => {
          const date = new Date(r.created_at);
          return date < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && date > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        }).length;
        return prev7 === 0 ? (last7 > 0 ? 100 : 0) : Math.round(((last7 - prev7) / prev7) * 100);
      })()
    }
  };

  return (
    <AdminContext.Provider 
      value={{ 
        users, 
        affiliateClicks, 
        analyticsEvents, 
        movieReviews,
        config, 
        stats, 
        isLoading, 
        refreshData: fetchData,
        updateConfig,
        updateUserRole,
        deleteUser
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = React.useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
