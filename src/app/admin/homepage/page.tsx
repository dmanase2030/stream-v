'use client';

import { useEffect, useState } from 'react';
import { PageTitle } from '../layout';
import { HOME_ROWS, getHiddenRows, setHiddenRows, getHeroPick, setHeroPick, HeroPick } from '@/lib/siteConfig';

const TMDB_KEY = '3ea9ba88a81be0f283362871b7f6b19e';

export default function AdminHomepage() {
  const [hiddenRows, setHiddenRowsState] = useState<string[]>([]);
  const [heroPick, setHeroPickState] = useState<HeroPick | null>(null);
  const [trendingPicks, setTrendingPicks] = useState<any[]>([]);

  useEffect(() => {
    setHiddenRowsState(getHiddenRows());
    setHeroPickState(getHeroPick());
    fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_KEY}`)
      .then((r) => r.json())
      .then((d) => setTrendingPicks((d.results || []).slice(0, 12)))
      .catch(() => {});
  }, []);

  const toggleRow = (id: string) => {
    const next = hiddenRows.includes(id)
      ? hiddenRows.filter((r) => r !== id)
      : [...hiddenRows, id];
    setHiddenRowsState(next);
    setHiddenRows(next);
  };

  const pickHero = (id: number, type: 'movie' | 'tv') => {
    const pick = { id, type };
    setHeroPickState(pick);
    setHeroPick(pick);
  };

  const clearHero = () => {
    setHeroPickState(null);
    setHeroPick(null);
  };

  return (
    <div>
      <PageTitle title="Homepage" sub="Control the hero banner and which rows show." />
      <div className="bg-[#141414] border border-white/10 rounded-md p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Hero Banner</h2>
            <p className="text-white/40 text-xs mt-1">
              {heroPick ? `Custom: ${heroPick.type} #${heroPick.id}` : 'Auto: trending #1'}
            </p>
          </div>
          {heroPick && (
            <button onClick={clearHero} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded transition">
              Use Auto
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {trendingPicks.map((t) => {
            const active = heroPick?.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => pickHero(t.id, t.media_type === 'tv' ? 'tv' : 'movie')}
                className={`relative aspect-[2/3] rounded overflow-hidden border-2 transition ${active ? 'border-[#E50914]' : 'border-transparent hover:border-white/40'}`}
              >
                {t.poster_path ? (
                  <img src={`https://image.tmdb.org/t/p/w185${t.poster_path}`} alt={t.title || t.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#2a2a2a]" />
                )}
                {active && (
                  <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#E50914] flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="bg-[#141414] border border-white/10 rounded-md p-6">
        <h2 className="text-lg font-semibold mb-1">Homepage Rows</h2>
        <p className="text-white/40 text-xs mb-4">Toggle which rows appear on the homepage.</p>
        <div className="space-y-1">
          {HOME_ROWS.map((row) => {
            const visible = !hiddenRows.includes(row.id);
            return (
              <button
                key={row.id}
                onClick={() => toggleRow(row.id)}
                className="w-full flex items-center justify-between px-4 py-3 rounded hover:bg-white/5 transition"
              >
                <span className={`text-sm ${visible ? 'text-white' : 'text-white/40'}`}>{row.label}</span>
                <span className={`w-11 h-6 rounded-full p-0.5 transition-colors ${visible ? 'bg-[#E50914]' : 'bg-white/15'}`}>
                  <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${visible ? 'translate-x-5' : 'translate-x-0'}`} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
