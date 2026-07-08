import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Load offline fallback session if present (e.g., if Supabase is offline, paused, or network is blocked)
    const offlineSessionRaw = localStorage.getItem('rothstudios_offline_session');
    if (offlineSessionRaw) {
      try {
        const offlineData = JSON.parse(offlineSessionRaw);
        if (offlineData?.user && offlineData?.profile) {
          if (active) {
            setSession(offlineData.session || null);
            setUser(offlineData.user || null);
            setProfile(offlineData.profile || null);
            setLoading(false);
          }
          return;
        }
      } catch (e) {
        console.error('Failed to parse offline session:', e);
      }
    }

    // Get initial session safely
    supabase.auth.getSession()
      .then(({ data }) => {
        if (!active) return;
        const session = data?.session ?? null;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to get initial session:', err);
        if (active) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      });

    // Listen for auth changes safely
    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      });
      subscription = data?.subscription ?? null;
    } catch (err) {
      console.error('Failed to set up auth state listener:', err);
    }

    return () => {
      active = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile doesn't exist, it might be a new user (Supabase trigger usually creates it)
        // or we need to handle it gracefully
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Profile fetch unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = profile?.role === 'admin' || user?.email === 'thefeedbuzz.store@gmail.com';

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, isAdmin, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
