import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminProvider, useAdmin } from '../../context/AdminContext';
import { 
  Users, 
  TrendingUp, 
  MousePointer2, 
  Activity,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'motion/react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { SEO } from '../../components/SEO';

function StatCard({ title, value, icon: Icon, trend, color }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass p-6 rounded-3xl border border-white/10"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-${color}-500/10`}>
          <Icon className={`w-6 h-6 text-${color}-500`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-bold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-display font-black text-white">{value}</h3>
      </div>
    </motion.div>
  );
}

function DashboardOverview() {
  const { stats, analyticsEvents, affiliateClicks } = useAdmin();

  // Generate real chart data from analytics events and affiliate clicks
  const generateChartData = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d,
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        views: 0,
        clicks: 0
      };
    });

    // Count views from analytics events
    analyticsEvents.forEach(event => {
      const eventDate = new Date(event.created_at);
      const dayIndex = last7Days.findIndex(d => 
        d.date.getDate() === eventDate.getDate() && 
        d.date.getMonth() === eventDate.getMonth()
      );
      
      if (dayIndex !== -1) {
        if (event.event_type === 'view' || event.event_type === 'movie_details') {
          last7Days[dayIndex].views++;
        }
      }
    });

    // Count clicks from affiliate clicks
    affiliateClicks.forEach(click => {
      const clickDate = new Date(click.created_at);
      const dayIndex = last7Days.findIndex(d => 
        d.date.getDate() === clickDate.getDate() && 
        d.date.getMonth() === clickDate.getMonth()
      );
      
      if (dayIndex !== -1) {
        last7Days[dayIndex].clicks++;
      }
    });

    return last7Days;
  };

  const chartData = generateChartData();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-white uppercase tracking-tight">Dashboard Overview</h1>
          <p className="text-zinc-500">Real-time performance analytics for RothStudios.</p>
        </div>
        <div className="flex items-center gap-4 bg-zinc-900 border border-white/5 p-2 rounded-2xl">
          <button className="px-4 py-2 bg-zinc-800 text-white rounded-xl text-sm font-bold">1W</button>
          <button className="px-4 py-2 text-zinc-500 rounded-xl text-sm font-bold hover:text-white transition-all">1M</button>
          <button className="px-4 py-2 text-zinc-500 rounded-xl text-sm font-bold hover:text-white transition-all">ALL</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} trend={stats.trends.users} color="brand-primary" />
        <StatCard title="Clicks" value={stats.totalClicks} icon={MousePointer2} trend={stats.trends.clicks} color="blue" />
        <StatCard title="Reviews" value={stats.totalReviews} icon={MessageSquare} trend={stats.trends.reviews} color="yellow" />
        <StatCard title="Online" value={stats.activeSessions} icon={Activity} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-3xl border border-white/10">
          <h3 className="text-xl font-display font-bold text-white mb-8 uppercase tracking-widest">Growth Analytics</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e50914" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#e50914" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #18181b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="views" stroke="#e50914" fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border border-white/10">
          <h3 className="text-xl font-display font-bold text-white mb-8 uppercase tracking-widest">Platform Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#09090b', border: '1px solid #18181b', borderRadius: '12px' }}
                   itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="clicks" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl border border-white/10">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-display font-bold text-white uppercase tracking-widest">Recent Reviews</h3>
          <button className="text-sm text-brand-primary font-bold hover:underline">View All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(useAdmin().movieReviews || []).slice(0, 6).map((review: any) => (
            <div key={review.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-yellow-500" />
                  </div>
                  <span className="text-sm font-bold text-white">{review.user_email?.split('@')[0]}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs font-black text-yellow-500">{review.rating}</span>
                </div>
              </div>
              <p className="text-sm text-zinc-400 line-clamp-2">"{review.comment}"</p>
              <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                {new Date(review.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
          {(useAdmin().movieReviews || []).length === 0 && (
            <div className="col-span-full py-12 text-center text-zinc-500">
              No reviews yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children?: React.ReactNode }) {
  return (
    <ProtectedRoute requireAdmin>
      <AdminProvider>
        <SEO 
          title="RothStudios – Admin Portal" 
          description="Internal RothStudios platform analytics dashboard and users and affiliate management terminal channels."
          noindex={true}
        />
        <div className="min-h-screen bg-black flex">
          <AdminSidebar />
          <main className="flex-1 p-8 md:p-12 overflow-y-auto">
            {children || <DashboardOverview />}
          </main>
        </div>
      </AdminProvider>
    </ProtectedRoute>
  );
}
