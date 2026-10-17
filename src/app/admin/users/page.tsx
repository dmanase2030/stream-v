'use client';

import { useEffect, useState } from 'react';
import { PageTitle, DataTable, StatusPill } from '../components';

interface AdminUser {
  id: string;
  username: string;
  avatar: string | null;
  firstSeen: number;
  lastSeen: number;
  banned: boolean;
  banReason?: string | null;
  isAdmin: boolean;
}

function timeAgo(ts: number) {
  if (!ts) return 'â';
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [banning, setBanning] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users || []);
        setTotal(d.total ?? (d.users || []).length);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(load, []);

  const doBan = async (id: string) => {
    const res = await fetch(`/api/admin/users/${id}/ban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: reason || 'Banned by admin' }),
    });
    if (res.ok) {
      setBanning(null);
      setReason('');
      setMsg('User banned.');
      load();
    } else {
      setMsg('Ban failed.');
    }
    setTimeout(() => setMsg(''), 2500);
  };

  const doUnban = async (id: string) => {
    const res = await fetch(`/api/admin/users/${id}/unban`, { method: 'POST' });
    if (res.ok) {
      setMsg('User unbanned.');
      load();
    } else {
      setMsg('Unban failed.');
    }
    setTimeout(() => setMsg(''), 2500);
  };

  const filtered = users.filter(
    (u) =>
      !q ||
      u.username.toLowerCase().includes(q.toLowerCase()) ||
      u.id.includes(q)
  );

  return (
    <div>
      <PageTitle
        title="Users"
        sub={`${total} registered user${total === 1 ? '' : 's'}. Search by username or Discord ID.`}
      />
      {msg && <p className="text-sm text-white/70 mb-4">{msg}</p>}
      <div className="flex gap-2 max-w-md mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search username or Discord ID"
          className="flex-1 bg-[#141414] border border-white/10 rounded px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30"
        />
      </div>
      {loading ? (
        <div className="bg-[#141414] border border-white/10 rounded-md h-48 animate-pulse" />
      ) : (
        <DataTable
          columns={['User', 'Discord ID', 'First Seen', 'Last Seen', 'Status', '']}
          empty="No users yet. Users appear here after signing in with Discord."
          rows={filtered.map((u) => [
            <span className="flex items-center gap-2" key="u">
              {u.avatar ? (
                <img src={u.avatar} alt="" className="w-7 h-7 rounded-full" />
              ) : (
                <span className="w-7 h-7 rounded-full bg-[#E50914] flex items-center justify-center text-xs font-bold text-white">
                  {u.username[0]?.toUpperCase()}
                </span>
              )}
              <span className="font-medium">{u.username}</span>
              {u.isAdmin && <StatusPill value="admin" />}
            </span>,
            <span className="text-white/40 text-xs font-mono" key="id">{u.id}</span>,
            <span className="text-white/40 text-xs" key="fs">{timeAgo(u.firstSeen)}</span>,
            <span className="text-white/40 text-xs" key="ls">{timeAgo(u.lastSeen)}</span>,
            <StatusPill key="st" value={u.banned ? 'banned' : 'active'} />,
            u.banned ? (
              <button
                key="b"
                onClick={() => doUnban(u.id)}
                disabled={u.isAdmin}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-30"
              >
                Unban
              </button>
            ) : (
              <button
                key="b"
                onClick={() => setBanning(u.id)}
                disabled={u.isAdmin}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-[#E50914]/15 hover:bg-[#E50914]/30 text-[#E50914] transition disabled:opacity-30"
              >
                Ban
              </button>
            ),
          ])}
        />
      )}
      {banning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setBanning(null)} />
          <div className="relative bg-[#1a1a1a] border border-white/10 rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2">Ban user</h3>
            <p className="text-white/50 text-sm mb-4">They will be signed out and blocked from the site.</p>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason (optional)"
              className="w-full bg-black/60 border border-white/10 rounded px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setBanning(null)}
                className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded transition"
              >
                Cancel
              </button>
              <button
                onClick={() => doBan(banning)}
                className="flex-1 px-4 py-2.5 bg-[#E50914] hover:bg-[#f6121d] text-white text-sm font-bold rounded transition"
              >
                Ban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
