'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getWatchHistory, removeFromHistory, clearHistory, WatchHistoryItem } from '@/lib/history';
import { getImageUrl } from '@/lib/tmdb';

export default function HistoryPage() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  const load = () => setHistory(getWatchHistory().sort((a, b) => b.timestamp - a.timestamp));
  useEffect(load, []);

  const remove = (item: WatchHistoryItem) => {
    removeFromHistory(item.id, item.type, item.season, item.episode);
    load();
  };

  const clear = () => {
    if (confirm('Clear all watch history?')) {
      clearHistory();
      load();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-[4%] py-8 pt-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Watch History</h1>
          {history.length > 0 && (
            <button onClick={clear} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded transition">
              Clear All
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 mb-4">Nothing watched yet.</p>
            <Link href="/" className="px-6 py-3 bg-[#E50914] hover:bg-[#f6121d] text-white font-bold rounded transition">
              Browse Titles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {history.map((item) => {
              const key = `${item.type}-${item.id}-${item.season || 0}-${item.episode || 0}`;
              const href = item.type === 'tv' && item.season && item.episode
                ? `/watch/tv/${item.id}/${item.season}/${item.episode}`
                : `/watch/${item.type}/${item.id}`;
              return (
                <div key={key} className="relative group">
                  <Link href={href}>
                    <div className="relative aspect-video rounded-md overflow-hidden bg-[#1a1a1a]">
                      {item.backdrop_path ? (
                        <Image src={getImageUrl(item.backdrop_path, 'w500')} alt={item.title} fill className="object-cover" sizes="300px" />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white text-xs font-semibold line-clamp-1">{item.title}</p>
                        {item.season && item.episode && (
                          <p className="text-white/60 text-[10px]">S{item.season} E{item.episode} · {Math.round(item.progress)}%</p>
                        )}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
                        <div className="h-full bg-[#E50914]" style={{ width: `${item.progress}%` }} />
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => remove(item)}
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/70 hover:bg-[#E50914] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    aria-label="Remove from history"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
