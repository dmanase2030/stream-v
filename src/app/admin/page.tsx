'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getWatchHistory } from '@/lib/history';

interface User {
  id: string;
  username: string;
  avatar: string | null;
  isAdmin: boolean;
}

const ANNOUNCEMENT_KEY = 'luniflex_announcement';

export function getAnnouncement(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ANNOUNCEMENT_KEY);
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  const [savedAnnouncement, setSavedAnnouncement] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, movies: 0, shows: 0 });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        setUser(d.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Load announcement + stats
    setSavedAnnouncement(localStorage.getItem(ANNOUNCEMENT_KEY));
    setAnnouncement(localStorage.getItem(ANNOUNCEMENT_KEY) || '');
    const history = getWatchHistory();
    setStats({
      total: history.length,
      completed: history.filter(h => h.completed).length,
      inProgress: history.filter(h => !h.completed && h.progress > 0).length,
      movies: history.filter(h => h.type === 'movie').length,
      shows: new Set(history.filter(h => h.type === 'tv').map(h => h.id)).size,
    });
  }, []);

  const saveAnnouncement = () => {
    if (announcement.trim()) {
      localStorage.setItem(ANNOUNCEMENT_KEY, announcement.trim());
      setSavedAnnouncement(announcement.trim());
    } else {
      localStorage.removeItem(ANNOUNCEMENT_KEY);
      setSavedAnnouncement(null);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const clearAnnouncement = () => {
    localStorage.removeItem(ANNOUNCEMENT_KEY);
    setAnnouncement('');
    setSavedAnnouncement(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141414]">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141414] px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Admin Access Required</h1>
          <p className="text-white/60 mb-6">Sign in with Discord to access the admin panel.</p>
          <a
            href="/api/auth/discord"
            className="inline-block px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-lg transition"
          >
            Sign in with Discord
          </a>
        </div>
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141414] px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-white/60">Your Discord account is not authorized as an admin.</p>
          <Link href="/" className="inline-block mt-6 text-[#5865F2] hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[#E50914] text-2xl font-black tracking-tight">LUNIFLEX</h1>
            <h2 className="text-2xl font-medium text-white mt-1">Admin Panel</h2>
            <p className="text-white/50 text-sm mt-1">Welcome, {user.username}</p>
          </div>
          <Link href="/" className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded hover:bg-white/90 transition">
            View Site
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1f1f1f] rounded-md p-5 hover:bg-[#2a2a2a] transition-colors">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Total Watched</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-[#1f1f1f] rounded-md p-5 hover:bg-[#2a2a2a] transition-colors">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Completed</p>
            <p className="text-3xl font-bold text-emerald-400">{stats.completed}</p>
          </div>
          <div className="bg-[#1f1f1f] rounded-md p-5 hover:bg-[#2a2a2a] transition-colors">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">In Progress</p>
            <p className="text-3xl font-bold text-[#E50914]">{stats.inProgress}</p>
          </div>
          <div className="bg-[#1f1f1f] rounded-md p-5 hover:bg-[#2a2a2a] transition-colors">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Movies / Shows</p>
            <p className="text-3xl font-bold">{stats.movies}<span className="text-white/30 text-lg"> / {stats.shows}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Announcement manager */}
          <div className="bg-[#1f1f1f] rounded-md p-6">
            <h2 className="text-lg font-semibold mb-1">Site Announcement</h2>
            <p className="text-white/40 text-xs mb-4">Shows as a banner at the top of every page.</p>
            <textarea
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="e.g. New episodes added every Friday!"
              rows={3}
              className="w-full bg-black/60 border border-white/10 rounded px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 resize-none"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={saveAnnouncement}
                className="flex-1 px-4 py-2.5 bg-[#E50914] hover:bg-[#f6121d] text-white text-sm font-bold rounded transition"
              >
                {saved ? 'Saved!' : savedAnnouncement ? 'Update' : 'Publish'}
              </button>
              {savedAnnouncement && (
                <button
                  onClick={clearAnnouncement}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white/70 text-sm rounded-lg transition"
                >
                  Clear
                </button>
              )}
            </div>
            {savedAnnouncement && (
              <div className="mt-4 p-3 bg-black/40 border-l-2 border-[#E50914] rounded-r">
                <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1">Live now</p>
                <p className="text-sm text-white/80">{savedAnnouncement}</p>
              </div>
            )}
          </div>

          {/* Admin profile + quick actions */}
          <div className="space-y-4">
            <div className="bg-[#1f1f1f] rounded-md p-6">
              <h2 className="text-lg font-semibold mb-4">Admin</h2>
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#5865F2] flex items-center justify-center font-bold text-lg">
                    {user.username[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-white/40 text-xs">ID: {user.id}</p>
                </div>
              </div>
              <a
                href="/api/auth/logout"
                className="block mt-4 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded text-sm text-center font-medium transition"
              >
                Sign Out
              </a>
            </div>

            <div className="bg-[#1f1f1f] rounded-md p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
              <div className="space-y-2">
                <a
                  href="https://dash.cloudflare.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-3 bg-black/40 hover:bg-black/60 rounded text-sm transition"
                >
                  <span>Cloudflare Dashboard</span>
                  <span className="text-white/30">↗</span>
                </a>
                <a
                  href="https://github.com/dmanase2030/stream-v"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-3 bg-black/40 hover:bg-black/60 rounded text-sm transition"
                >
                  <span>GitHub Repo</span>
                  <span className="text-white/30">↗</span>
                </a>
                <a
                  href="https://discord.com/developers/applications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-3 bg-black/40 hover:bg-black/60 rounded text-sm transition"
                >
                  <span>Discord Developers</span>
                  <span className="text-white/30">↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* System status */}
        <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">System</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-white/50">Site Status</span>
              <span className="flex items-center gap-2 text-emerald-400">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                Operational
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-white/50">Discord OAuth</span>
              <span className="text-emerald-400">Configured</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-white/50">Video Source</span>
              <span className="text-white/70">VixSrc</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-white/50">Hosting</span>
              <span className="text-white/70">Cloudflare Pages</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
