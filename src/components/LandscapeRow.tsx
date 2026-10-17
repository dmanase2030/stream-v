'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Movie } from '@/types';
import { getBackdropUrl } from '@/lib/tmdb';

interface LandscapeRowProps {
  title: string;
  movies: Movie[];
  type?: 'movie' | 'tv';
}

export default function LandscapeRow({ title, movies, type }: LandscapeRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const handleScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeft(scrollLeft > 20);
    setShowRight(scrollLeft < scrollWidth - clientWidth - 20);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({
      left: direction === 'left' ? -rowRef.current.clientWidth * 0.8 : rowRef.current.clientWidth * 0.8,
      behavior: 'smooth',
    });
  };

  if (!movies?.length) return null;

  return (
    <div className="relative mb-8 lg:mb-10 group/row">
      <h2 className="text-white text-lg lg:text-xl font-medium mb-3 px-[4%] hover:text-white/70 transition-colors cursor-pointer inline-block">
        {title}
        <span className="inline-block ml-2 text-xs text-[#54b9c5] opacity-0 group-hover/row:opacity-100 transition-opacity">
          Explore All ›
        </span>
      </h2>

      <div className="relative">
        {showLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-20 w-[4%] min-w-[40px] bg-[#141414]/70 hover:bg-[#141414]/90 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-2 overflow-x-auto hide-scrollbar scroll-smooth px-[4%] pb-2"
        >
          {movies.map((movie) => {
            const mediaType = type || (movie.media_type === 'tv' || movie.first_air_date ? 'tv' : 'movie');
            const title = movie.title || movie.name || '';
            const backdrop = getBackdropUrl(movie.backdrop_path, 'w780');
            return (
              <Link
                key={`${mediaType}-${movie.id}`}
                href={`/${mediaType}/${movie.id}`}
                className="flex-shrink-0 w-[280px] sm:w-[320px] group/card"
              >
                <div className="relative aspect-video rounded overflow-hidden bg-[#2a2a2a] transition-transform duration-300 group-hover/card:scale-[1.03] group-hover/card:z-10">
                  {backdrop ? (
                    <Image
                      src={backdrop}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="320px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <span className="text-white/60 text-sm font-medium text-center line-clamp-2">{title}</span>
                    </div>
                  )}
                  {/* Brand corner badge */}
                  <div className="absolute top-0 left-0 bg-[#E50914] text-white text-[10px] font-black px-1.5 py-0.5 rounded-br">
                    L
                  </div>
                  {/* Hover play */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                      <svg className="w-6 h-6 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  {/* Bottom label like "New Episodes" */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white text-xs font-semibold truncate">{title}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {showRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-20 w-[4%] min-w-[40px] bg-[#141414]/70 hover:bg-[#141414]/90 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
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
