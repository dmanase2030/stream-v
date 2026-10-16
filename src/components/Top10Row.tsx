'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Movie } from '@/types';
import { getImageUrl } from '@/lib/tmdb';

interface Top10RowProps {
  title: string;
  movies: Movie[];
  type?: 'movie' | 'tv';
}

export default function Top10Row({ title, movies, type }: Top10RowProps) {
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

  const top10 = movies.slice(0, 10);
  if (!top10.length) return null;

  return (
    <div className="relative mb-8 lg:mb-10 group/row">
      <h2 className="text-white text-lg lg:text-xl font-medium mb-3 px-[4%]">
        {title}
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
          className="flex gap-1 overflow-x-auto hide-scrollbar scroll-smooth px-[4%] pb-2"
        >
          {top10.map((movie, i) => {
            const mediaType = type || (movie.media_type === 'tv' || movie.first_air_date ? 'tv' : 'movie');
            return (
              <Link
                key={movie.id}
                href={`/${mediaType}/${movie.id}`}
                className="flex-shrink-0 flex items-end group/card"
              >
                {/* Giant Netflix number */}
                <span
                  className="text-[120px] sm:text-[160px] lg:text-[180px] font-black leading-[0.8] text-[#141414] select-none -mr-3 sm:-mr-4"
                  style={{
                    WebkitTextStroke: '4px #595959',
                    fontFamily: 'Arial Black, sans-serif',
                  }}
                >
                  {i + 1}
                </span>
                <div className="relative w-[110px] sm:w-[130px] lg:w-[140px] aspect-[2/3] rounded overflow-hidden bg-[#2a2a2a] transition-transform duration-300 group-hover/card:scale-[1.04]">
                  <Image
                    src={getImageUrl(movie.poster_path, 'w342')}
                    alt={movie.title || movie.name || ''}
                    fill
                    className="object-cover"
                    sizes="140px"
                  />
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
