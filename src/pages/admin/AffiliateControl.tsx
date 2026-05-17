import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminDashboard';
import { useAdmin } from '../../context/AdminContext';
import { Globe, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { motion } from 'motion/react';

export default function AffiliateControl() {
  const { config, updateConfig, isLoading } = useAdmin();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const getConfigValue = (key: string) => config.find(c => c.key === key)?.value;

  const [links, setLinks] = useState({
    netflix_base: 'https://www.netflix.com/search?q=',
    amazon_base: 'https://www.amazon.com/s?k=',
    apple_base: 'https://tv.apple.com/search?term=',
    affiliate_enabled: true
  });

  // Sync state when config changes
  useEffect(() => {
    if (config.length > 0) {
      setLinks({
        netflix_base: getConfigValue('netflix_base') || 'https://www.netflix.com/search?q=',
        amazon_base: getConfigValue('amazon_base') || 'https://www.amazon.com/s?k=',
        apple_base: getConfigValue('apple_base') || 'https://tv.apple.com/search?term=',
        affiliate_enabled: getConfigValue('affiliate_enabled') ?? true
      });
    }
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await Promise.all(
        Object.entries(links).map(([key, value]) => updateConfig(key, value))
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save config:', error);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading && config.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-black text-white uppercase tracking-tight">Affiliate Control</h1>
            <p className="text-zinc-500">Configure global monetization and tracking links.</p>
          </div>
          <div className="flex items-center gap-4">
            {saved && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-green-500 text-sm font-bold"
              >
                <CheckCircle2 className="w-4 h-4" />
                Changes Saved
              </motion.div>
            )}
            <Button 
              className="shadow-xl shadow-brand-primary/20"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border border-white/10 space-y-8">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold">Affiliate System Status</h4>
                <p className="text-zinc-500 text-sm text-balance">Enable or disable all search redirects globally.</p>
              </div>
            </div>
            <button 
              onClick={() => setLinks({ ...links, affiliate_enabled: !links.affiliate_enabled })}
              className={`w-14 h-8 rounded-full transition-all relative ${links.affiliate_enabled ? 'bg-brand-primary' : 'bg-zinc-800'}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${links.affiliate_enabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="grid gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider ml-1">Netflix Search Link</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={links.netflix_base}
                  onChange={(e) => setLinks({ ...links, netflix_base: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-brand-primary/50 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider ml-1">Amazon Prime Video Link</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={links.amazon_base}
                  onChange={(e) => setLinks({ ...links, amazon_base: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-brand-primary/50 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider ml-1">Apple TV Link</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={links.apple_base}
                  onChange={(e) => setLinks({ ...links, apple_base: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-brand-primary/50 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
            <p className="text-sm text-blue-400 leading-relaxed">
              Updating these links will affect all users immediately. Clicks will continue to be tracked even if the base URL is changed.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
