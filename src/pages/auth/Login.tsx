import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, LogIn, AlertCircle, Play } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { cn } from '../../lib/utils';
import { SEO } from '../../components/SEO';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <SEO 
        title="Account Sign In | RothStudios"
        description="Sign in to your private RothStudios member account dashboard to access your customized movie lists, watchlist reviews, and stream trailers."
        noindex={true}
      />
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-md p-8 md:p-10 rounded-3xl border border-white/10 relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="bg-brand-primary p-1.5 rounded-lg shadow-lg">
              <Play className="w-5 h-5 fill-white text-white" />
            </div>
            <span className="text-2xl font-display font-bold tracking-tight text-white line-clamp-1">
              Roth<span className="text-brand-primary">Studios</span>
            </span>
          </Link>
          <h1 className="text-3xl font-display font-black text-white uppercase tracking-tight mb-2">Welcome Back</h1>
          <p className="text-zinc-400">Stream the best cinematic content today.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 text-red-500 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-brand-primary transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-sm font-medium text-zinc-300">Password</label>
              <Link to="/login" className="text-xs text-brand-primary hover:underline">Forgot password?</Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-brand-primary transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-lg font-bold uppercase tracking-wider shadow-xl shadow-brand-primary/20"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </div>
            ) : (
              <div className="flex items-center gap-2 text-white">
                <LogIn className="w-5 h-5" />
                Sign In
              </div>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-zinc-500 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-primary font-bold hover:underline">
              Join RothStudios
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
