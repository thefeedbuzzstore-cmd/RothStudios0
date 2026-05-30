import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, Play, User as UserIcon, Shield, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, isAdmin, refreshProfile } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Watchlist', path: '/watchlist' },
    { name: 'Search', path: '/search' },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-12 py-4',
        isScrolled ? 'glass py-3' : 'bg-gradient-to-b from-black/80 to-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-brand-primary p-1 rounded shadow-lg shadow-brand-primary/20 transition-transform group-hover:scale-110">
            <Play className="w-6 h-6 fill-white text-white" />
          </div>
          <span className="text-2xl font-display font-bold tracking-tight text-white">
            Roth<span className="text-brand-primary">Studios</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'text-sm font-medium transition-colors hover:text-brand-primary',
                location.pathname === link.path ? 'text-brand-primary' : 'text-zinc-400'
              )}
            >
              {link.name}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border',
                location.pathname.startsWith('/admin') 
                  ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20' 
                  : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20 hover:bg-brand-primary/20'
              )}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Panel
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/search" aria-label="Search Movies & series" className="p-2 text-zinc-400 hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </Link>
          <Link to="/watchlist" aria-label="View My Watchlist" className="p-2 text-zinc-400 hover:text-white transition-colors">
            <Heart className="w-5 h-5" />
          </Link>
          
          {user ? (
            <div className="relative group">
              <button aria-label="User account details" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-primary text-xs font-bold border border-brand-primary/30 hover:bg-brand-primary/30 transition-all">
                  {user.email?.[0].toUpperCase()}
                </div>
              </button>
              
              <div className="absolute right-0 mt-2 w-56 glass border border-white/10 rounded-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="px-4 py-3 border-b border-white/5 mb-2">
                  <p className="text-sm font-bold text-white truncate">{user.email}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                    {isAdmin ? 'Administrator' : 'Standard Member'}
                  </p>
                </div>

                {isAdmin ? (
                  <Link to="/admin" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-zinc-300 hover:text-white transition-all">
                    <Shield className="w-4 h-4 text-brand-primary" />
                    <span className="text-sm font-medium">Admin Dashboard</span>
                  </Link>
                ) : (
                  <button 
                    onClick={async () => {
                      setIsRefreshing(true);
                      await refreshProfile();
                      setIsRefreshing(false);
                    }}
                    disabled={isRefreshing}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all text-left"
                  >
                    <Activity className={cn("w-4 h-4 text-zinc-500", isRefreshing && "animate-spin")} />
                    <span className="text-sm font-medium">{isRefreshing ? 'Checking...' : 'Sync Permissions'}</span>
                  </button>
                )}

                <button 
                  onClick={() => supabase.auth.signOut()}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-all text-left mt-1"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 text-sm font-bold text-white bg-zinc-900 border border-white/10 px-4 py-2 rounded-xl hover:bg-zinc-800 transition-all">
              <UserIcon className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
