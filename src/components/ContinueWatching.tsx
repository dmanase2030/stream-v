'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { WatchHistoryItem, getLastWatched, getResumeUrl, getContinueWatching } from '@/lib/history';
import { SeasonDetail } from '@/types';

// Resolve the smart URL: if not finished → same content, if finished TV → next episode
async function resolveSmartUrl(item: WatchHistoryItem): Promise<{ url: string; label: string }> {
  const baseUrl = getResumeUrl(item);

  // Not completed → resume where they left off
  if (!item.completed) {
    return { url: baseUrl, label: 'Resume' };
  }

  // Completed movie → just rewatch
  if (item.type !== 'tv' || !item.season || !item.episode) {
    return { url: baseUrl, label: 'Watch Again' };
  }

  // Completed TV episode → find next episode
  try {
    const res = await fetch(`/api/season?tvId=${item.id}&season=${item.season}`);
    const data: SeasonDetail = await res.json();
    const episodes = data.episodes || [];
    const nextEp = episodes.find((ep) => ep.episode_number === item.episode! + 1);

    if (nextEp) {
      return {
        url: `/watch/tv/${item.id}?s=${item.season}&e=${nextEp.episode_number}`,
        label: `Play S${item.season} E${nextEp.episode_number}`,
      };
    }

    // Try next season
    const nextSeason = item.season + 1;
    return {
      url: `/watch/tv/${item.id}?s=${nextSeason}&e=1`,
      label: `Play S${nextSeason} E1`,
    };
  } catch {
    return { url: baseUrl, label: 'Watch Now' };
  }
}

export default function ContinueWatchingRow() {
  const [items, setItems] = useState<WatchHistoryItem[]>([]);
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  useEffect(() => {
    setItems(getContinueWatching());
  }, []);

  const handleScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeft(scrollLeft > 20);
    setShowRight(scrollLeft < scrollWidth - clientWidth - 20);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!rowRef.current) return;
    const scrollAmount = rowRef.current.clientWidth * 0.8;
    rowRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!items.length) return null;

  return (
    <div className="relative mb-8 lg:mb-10 group/row">
      {/* Netflix-style section title - matches ContentRow */}
      <h2 className="text-white text-base lg:text-lg font-medium mb-2 px-[4%] cursor-pointer inline-flex items-center group/title">
        Continue Watching
        <span className="inline-block ml-1 text-[#54b9c5] text-sm font-bold opacity-0 -translate-x-2 group-hover/title:opacity-100 group-hover/title:translate-x-0 group-hover/row:opacity-100 group-hover/row:translate-x-0 transition-all duration-200">
          ›
        </span>
      </h2>

      <div className="relative">
        {/* Left chevron - Netflix style */}
        {showLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-20 w-[4%] min-w-[40px] bg-black/70 hover:bg-black/90 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Cards - Netflix spacing, matches ContentRow */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-2 overflow-x-auto hide-scrollbar scroll-smooth px-[4%] pb-2"
        >
          {items.map((item) => {
            const imgUrl = item.backdrop_path
              ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}`
              : item.poster_path
                ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
                : '/no-poster.svg';

            return (
              <div key={`${item.type}-${item.id}-${item.season}-${item.episode}`} className="flex-shrink-0 w-[240px] sm:w-[280px] lg:w-[300px]">
                <Link href={getResumeUrl(item)} className="block group/card">
                  <div className="relative aspect-video rounded-md overflow-hidden bg-white/5 transition-transform duration-300 group-hover/card:scale-[1.04] group-hover/card:z-10 group-hover/card:shadow-2xl">
                    <Image src={imgUrl} alt={item.title} fill className="object-cover" sizes="300px" />
                    <div className="absolute top-1.5 left-1.5 z-10">
                      <span className="text-[#E50914] font-black text-sm leading-none drop-shadow-md" style={{ fontFamily: 'Arial Black, sans-serif' }}>N</span>
                    </div>
                    {/* Netflix red progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20">
                      <div
                        className="h-full bg-[#E50914]"
                        style={{ width: `${Math.max(item.progress, 5)}%` }}
                      />
                    </div>
                    {/* Episode badge for TV */}
                    {item.type === 'tv' && item.season && item.episode && (
                      <div className="absolute top-2 left-2 bg-black/60 text-[10px] font-medium text-white px-2 py-0.5 rounded">
                        S{item.season} E{item.episode}
                      </div>
                    )}
                    {/* Play overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                        <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Right chevron - Netflix style */}
        {showRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-20 w-[4%] min-w-[40px] bg-black/70 hover:bg-black/90 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export function HeroLastWatched({ fallbackHero }: { fallbackHero: React.ReactNode }) {
  const [lastWatched, setLastWatched] = useState<WatchHistoryItem | null>(null);
  const [mounted, setMounted] = useState(false);
  const [smartUrl, setSmartUrl] = useState<string | null>(null);
  const [buttonLabel, setButtonLabel] = useState('Watch Now');

  useEffect(() => {
    const init = async () => {
      const item = getLastWatched();
      setLastWatched(item);
      setMounted(true);

      if (item) {
        const resolved = await resolveSmartUrl(item);
        setSmartUrl(resolved.url);
        setButtonLabel(resolved.label);
      }
    };
    init();
  }, []);

  if (!mounted || !lastWatched) return <>{fallbackHero}</>;

  const backdrop = lastWatched.backdrop_path
    ? `https://image.tmdb.org/t/p/original${lastWatched.backdrop_path}`
    : null;

  const heroUrl = smartUrl || getResumeUrl(lastWatched);

  return (
    <div className="relative w-full h-[80vh] min-h-[550px] max-h-[800px] rounded-b-[2rem] overflow-hidden">
      {backdrop && (
        <Image src={backdrop} alt={lastWatched.title} fill priority className="object-cover object-top" sizes="100vw" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-black/20" />

      <div className="absolute inset-0 flex items-center">
        <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-14 w-full">
          <div className="max-w-lg animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-1 mb-4 text-xs text-white/70">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Continue Watching
              {lastWatched.type === 'tv' && lastWatched.season && lastWatched.episode && (
                <span className="text-white/40"> &middot; S{lastWatched.season} E{lastWatched.episode}</span>
              )}
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-wide leading-[0.95] mb-5">
              {lastWatched.title}
            </h1>

            <p className="text-white/60 text-sm sm:text-[15px] leading-relaxed mb-6 line-clamp-2">
              {lastWatched.overview}
            </p>

            {/* Progress indicator */}
            {lastWatched.progress > 0 && lastWatched.progress < 100 && (
              <div className="w-48 mb-5">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-red rounded-full" style={{ width: `${lastWatched.progress}%` }} />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Link
                href={heroUrl}
                className="inline-flex items-center gap-2.5 bg-white text-black font-semibold px-7 py-3 rounded-full transition-all duration-300 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98]"
              >
                {buttonLabel}
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </Link>
              <Link
                href={`/${lastWatched.type}/${lastWatched.id}`}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-7 py-3 rounded-full transition-all duration-300 backdrop-blur-md border border-white/10"
              >
                Details
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
