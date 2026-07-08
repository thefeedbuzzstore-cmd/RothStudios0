import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = !!(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder') && !supabaseUrl.includes('your_'));

// Safe mockup of Supabase client when database is offline/unconfigured to prevent unhandled fetch crashes
const createMockSupabase = () => {
  const chain = () => {
    const promise = Promise.resolve({ data: [], error: null });
    const proxy: any = new Proxy(promise, {
      get(target, prop) {
        if (prop === 'then') return target.then.bind(target);
        if (prop === 'catch') return target.catch.bind(target);
        if (prop === 'finally') return target.finally.bind(target);
        return () => proxy; // Chain any method to itself (e.g. select, eq, order, single)
      }
    });
    return proxy;
  };

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: (callback: any) => {
        // Safe no-op auth state changer
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signOut: async () => ({ error: null }),
      signUp: async () => ({ data: { user: null }, error: new Error('Database is in offline mode') }),
      signInWithPassword: async () => ({ data: { session: null, user: null }, error: new Error('Database is in offline mode') }),
    },
    from: (table: string) => {
      // Return a chainable thenable mock query builder
      return chain();
    }
  } as any;
};

// Standard client for Vite SPA - only initialize if we have credentials, otherwise use safe mock
const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  try {
    const response = await fetch(input, init);
    return response;
  } catch (error: any) {
    console.error('Supabase connection failed (Failed to fetch). Utilizing graceful offline fallback:', error);
    
    const urlString = typeof input === 'string' ? input : (input as any).url || '';
    let mockData: any = [];
    
    // Graceful JSON fallbacks depending on the endpoint to satisfy client parsing
    if (urlString.includes('/auth/v1/')) {
      mockData = { session: null, user: null };
    } else if (urlString.includes('/rest/v1/')) {
      if (urlString.includes('limit=1') || urlString.includes('single')) {
        mockData = null;
      } else {
        mockData = [];
      }
    }
    
    return new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: customFetch
      }
    })
  : createMockSupabase();

if (!isConfigured) {
  console.warn('Supabase credentials missing or invalid. Utilizing a secure, network-immune mock database fallback.');
}
