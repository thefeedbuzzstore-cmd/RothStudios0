/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WatchlistProvider } from './context/WatchlistContext';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { Navbar } from './components/Navbar';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import Search from './pages/Search';
import Watchlist from './pages/Watchlist';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AffiliateControl from './pages/admin/AffiliateControl';
import { analytics } from './services/analytics';
import { useAuth } from './context/AuthContext';
import { useEffect } from 'react';

import { Toaster } from 'sonner';

function AppContent() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-bg-dark text-white font-sans selection:bg-brand-primary selection:text-white">
      <Toaster position="bottom-right" richColors theme="dark" />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/search" element={<Search />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/affiliates" element={<AffiliateControl />} />
          <Route path="/admin/analytics" element={<AdminDashboard />} />
        </Routes>
      </main>
      
      <footer className="py-12 border-t border-white/5 bg-black/40 mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="bg-brand-primary p-1 rounded">
                <div className="w-5 h-5 bg-white rounded-sm" style={{ clipPath: 'polygon(20% 10%, 90% 50%, 20% 90%)' }} />
              </div>
              <span className="text-xl font-display font-bold tracking-tight">
                Roth<span className="text-brand-primary">Studios</span>
              </span>
            </div>
            <p className="text-zinc-500 text-sm max-w-xs">
              A premium cinematic experience. Discover, watch, and save your favorite movies in one place.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-zinc-400 text-sm font-medium">Powered by Supabase & TMDB</p>
            <p className="text-zinc-600 text-xs">© 2026 RothStudios. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <WatchlistProvider>
          <Router>
            <AppContent />
          </Router>
        </WatchlistProvider>
      </AdminProvider>
    </AuthProvider>
  );
}

