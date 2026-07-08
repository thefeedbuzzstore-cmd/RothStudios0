import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, UserPlus, AlertCircle, Play } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { SEO } from '../../components/SEO';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      
      // Some Supabase setups require email confirmation.
      // If confirmation is off, it auto-signs in.
      // We'll show a message or redirect.
      navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('network error') || msg.toLowerCase().includes('load failed')) {
        setError('Connection failed (Failed to fetch). This usually means your Supabase project is paused (due to inactivity), your network/ad-blocker is blocking the request, or the environment variables are invalid. Please open your Supabase Dashboard, verify your project is active (resume/restore it if paused), or check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY variables.');
      } else {
        setError(msg || 'An error occurred during registration');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <SEO 
        title="Account Sign Up | RothStudios"
        description="Create a free RothStudios member account today to build premium customized lists, watch trailers, and rate cinema on-demand."
        noindex={true}
      />
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
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
          <h1 className="text-3xl font-display font-black text-white uppercase tracking-tight mb-2">Create Account</h1>
          <p className="text-zinc-400">Join the cinematic revolution.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
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
            <label className="text-sm font-medium text-zinc-300 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-brand-primary transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all"
                placeholder="Min. 6 characters"
                minLength={6}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 ml-1">Confirm Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-brand-primary transition-colors" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all"
                placeholder="Repeat password"
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
                Joining...
              </div>
            ) : (
              <div className="flex items-center gap-2 text-white">
                <UserPlus className="w-5 h-5" />
                Create Account
              </div>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-zinc-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-primary font-bold hover:underline">
              Sign In here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
