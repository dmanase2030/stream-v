'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getWatchHistory } from '@/lib/history';
import { PageTitle } from './layout';

export default function AdminOverview() {
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, movies: 0, shows: 0 });
  const [userCount, setUserCount] = useState<number | null>(null);
  const [bannedCount, setBannedCount] = useState<number | null>(null);

  useEffect(() => {
    try {
      const history = getWatchHistory();
      setStats({
        total: history.length,
        completed: history.filter((h: any) => h.completed).length,
        inProgress: history.filter((h: any) => !h.completed && h.progress > 0).length,
        movies: history.filter((h: any) => h.type === 'movie').length,
        shows: history.filter((h: any) => h.type === 'tv').length,
      });
    } catch {}
    fetch('/api/admin/users')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setUserCount(d.total ?? d.users?.length ?? 0);
          setBannedCount(d.users?.filter((u: any) => u.banned).length ?? 0);
        }
      })
      .catch(() => {});
  }, []);

  const cards = [
    { label: 'Registered Users', value: userCount ?? '—', color: '' },
    { label: 'Banned Users', value: bannedCount ?? '—', color: 'text-[#E50914]' },
    { label: 'Total Watched', value: stats.total, color: '' },
    { label: 'Completed', value: stats.completed, color: 'text-emerald-400' },
    { label: 'In Progress', value: stats.inProgress, color: 'text-[#E50914]' },
  ];

  const links = [
    { href: '/admin/users', title: 'Users', desc: 'View and manage registered users' },
    { href: '/admin/bans', title: 'Bans', desc: 'Banned users and unban' },
    { href: '/admin/announcements', title: 'Announcements', desc: 'Site-wide banner message' },
    { href: '/admin/homepage', title: 'Homepage', desc: 'Hero pick and row visibility' },
    { href: '/admin/settings', title: 'Settings', desc: 'Data and site settings' },
  ];

  return (
    <div>
      <PageTitle
        title="Overview"
        sub="Site stats and quick links."
        action={
          <Link href="/" className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded hover:bg-white/90 transition">
            View Site
          </Link>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-[#141414] border border-white/10 rounded-md p-5">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{c.label}</p>
            <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>
      <h2 className="text-lg font-semibold mb-3">Manage</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="bg-[#141414] border border-white/10 rounded-md p-5 hover:bg-[#1c1c1c] hover:border-white/20 transition">
            <p className="font-semibold mb-1">{l.title}</p>
            <p className="text-white/40 text-sm">{l.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
