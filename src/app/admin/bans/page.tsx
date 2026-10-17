'use client';

import { useEffect, useState } from 'react';
import { PageTitle, DataTable, StatusPill } from '../layout';

interface BannedUser {
  id: string;
  username: string;
  avatar: string | null;
  banReason?: string | null;
  bannedAt?: number;
}

export default function AdminBans() {
  const [users, setUsers] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((d) => {
        setUsers((d.users || []).filter((u: any) => u.banned));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(load, []);

  const doUnban = async (id: string) => {
    const res = await fetch(`/api/admin/users/${id}/unban`, { method: 'POST' });
    setMsg(res.ok ? 'User unbanned.' : 'Unban failed.');
    if (res.ok) load();
    setTimeout(() => setMsg(''), 2500);
  };

  return (
    <div>
      <PageTitle title="Bans" sub={`${users.length} banned user${users.length === 1 ? '' : 's'}.`} />
      {msg && <p className="text-sm text-white/70 mb-4">{msg}</p>}
      {loading ? (
        <div className="bg-[#141414] border border-white/10 rounded-md h-48 animate-pulse" />
      ) : (
        <DataTable
          columns={['User', 'Reason', 'Status', '']}
          empty="No banned users."
          rows={users.map((u) => [
            <span className="flex items-center gap-2" key="u">
              {u.avatar ? (
                <img src={u.avatar} alt="" className="w-7 h-7 rounded-full" />
              ) : (
                <span className="w-7 h-7 rounded-full bg-[#E50914] flex items-center justify-center text-xs font-bold text-white">
                  {u.username[0]?.toUpperCase()}
                </span>
              )}
              <span className="font-medium">{u.username}</span>
            </span>,
            <span className="text-white/50 text-sm" key="r">{u.banReason || '—'}</span>,
            <StatusPill key="s" value="banned" />,
            <button
              key="b"
              onClick={() => doUnban(u.id)}
              className="px-3 py-1.5 text-xs font-semibold rounded bg-white/10 hover:bg-white/20 text-white transition"
            >
              Unban
            </button>,
          ])}
        />
      )}
    </div>
  );
}
