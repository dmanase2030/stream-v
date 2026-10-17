'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAutoplay, setAutoplay, getTrailerAutoplay, setTrailerAutoplay } from '@/lib/settings';
import { getWatchHistory } from '@/lib/history';
import { getMyList, clearMyList } from '@/lib/myList';

interface User {
  id: string;
  username: string;
  avatar: string | null;
  isAdmin: boolean;
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${on ? 'bg-[#E50914]' : 'bg-white/15'}`}
      aria-label="Toggle"
    >
      <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${on ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [autoplay, setAutoplayState] = useState(true);
  const [trailerAuto, setTrailerAutoState] = useState(false);
  const [stats, setStats] = useState({ watched: 0, list: 0 });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
      .catch(() => {});
    setAutoplayState(getAutoplay());
    setTrailerAutoState(getTrailerAutoplay());
    try {
      setStats({ watched: getWatchHistory().length, list: getMyList().length });
    } catch {}
  }, []);

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 2500);
  };

  const clearHistory = () => {
    localStorage.removeItem('streamv-watch-history');
    setStats((s) => ({ ...s, watched: 0 }));
    flash('Watch history cleared.');
  };

  const clearList = () => {
    clearMyList();
    setStats((s) => ({ ...s, list: 0 }));
    flash('My List cleared.');
  };

  const replayIntro = () => {
    sessionStorage.removeItem('luniflex_intro_shown');
    flash('Intro will play on your next visit.');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        {msg && <p className="text-sm text-white/70 mb-4 bg-white/5 border border-white/10 rounded px-4 py-2">{msg}</p>}

        {/* Account */}
        <section className="bg-[#141414] border border-white/10 rounded-md p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          {user ? (
            <div className="flex items-center gap-4">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-14 h-14 rounded-full" />
              ) : (
                <span className="w-14 h-14 rounded-full bg-[#E50914] flex items-center justify-center text-xl font-bold">
                  {user.username[0]?.toUpperCase()}
                </span>
              )}
              <div className="flex-1">
                <p className="font-semibold">{user.username}</p>
                <p className="text-white/40 text-xs">Signed in with Discord</p>
              </div>
              <a
                href="/api/auth/logout"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded transition"
              >
                Sign Out
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-white/50 text-sm">You're browsing as a guest.</p>
              <a
                href="/api/auth/discord"
                className="px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-semibold rounded transition"
              >
                Sign In
              </a>
            </div>
          )}
          {user?.isAdmin && (
            <Link href="/admin" className="inline-block mt-4 text-sm text-[#E50914] hover:underline">
              Go to Admin Panel →
            </Link>
          )}
        </section>

        {/* Playback */}
        <section className="bg-[#141414] border border-white/10 rounded-md p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">Playback</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Autoplay next episode</p>
                <p className="text-white/40 text-xs mt-0.5">Automatically play the next episode when one ends.</p>
              </div>
              <Toggle on={autoplay} onChange={(v) => { setAutoplay(v); setAutoplayState(v); }} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Auto-play trailers</p>
                <p className="text-white/40 text-xs mt-0.5">Play trailers automatically in the details popup.</p>
              </div>
              <Toggle on={trailerAuto} onChange={(v) => { setTrailerAutoplay(v); setTrailerAutoState(v); }} />
            </div>
          </div>
        </section>

        {/* Your data */}
        <section className="bg-[#141414] border border-white/10 rounded-md p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">Your Data</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-black/40 rounded p-4">
              <p className="text-2xl font-bold">{stats.watched}</p>
              <p className="text-white/40 text-xs">Titles watched</p>
            </div>
            <div className="bg-black/40 rounded p-4">
              <p className="text-2xl font-bold">{stats.list}</p>
              <p className="text-white/40 text-xs">In My List</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/history" className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded transition">
              View Watch History
            </Link>
            <button onClick={clearHistory} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded transition">
              Clear History
            </button>
            <button onClick={clearList} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded transition">
              Clear My List
            </button>
            <button onClick={replayIntro} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded transition">
              Replay Intro
            </button>
          </div>
        </section>

        <Link href="/" className="text-sm text-white/50 hover:text-white transition">← Back to home</Link>
      </div>
    </div>
  );
}
