import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BarChart3, 
  ArrowLeft, 
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

export function AdminSidebar() {
  const location = useLocation();

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Affiliate Control', path: '/admin/affiliates', icon: Settings },
    { name: 'Analytics & SEO', path: '/admin/analytics-seo', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-zinc-950/50 backdrop-blur-xl h-screen sticky top-0 flex flex-col">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2 mb-8 group">
          <ArrowLeft className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:-translate-x-1 transition-all" />
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Back to Site</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-primary rounded-lg">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-black text-white text-xl uppercase tracking-tighter">
            ADMIN<span className="text-brand-primary">HUB</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <button 
          onClick={() => supabase.auth.signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
