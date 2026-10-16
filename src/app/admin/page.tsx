'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  avatar: string | null;
  isAdmin: boolean;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        setUser(d.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
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
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
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
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-white/50 mt-1">Welcome, {user.username}</p>
          </div>
          <Link href="/" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition">
            View Site
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-2">Site Status</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-white/70 text-sm">All systems operational</span>
            </div>
            <p className="text-white/40 text-xs mt-4">Running on Cloudflare Pages (Edge)</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-2">Admin</h2>
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center font-bold">
                  {user.username[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium">{user.username}</p>
                <p className="text-white/40 text-xs">ID: {user.id}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
            <div className="space-y-2">
              <a
                href="/api/auth/logout"
                className="block px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm text-center transition"
              >
                Sign Out
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Configuration</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-white/50">Discord OAuth</span>
              <span className="text-green-400">Configured</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-white/50">Admin Access</span>
              <span className="text-white/70">Discord ID allowlist</span>
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
