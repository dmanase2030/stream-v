'use client';

import { useRef, useState } from 'react';
import ContentCard from './ContentCard';
import { Movie } from '@/types';

interface ContentRowProps {
  title: string;
  movies: Movie[];
  type?: 'movie' | 'tv';
}

export default function ContentRow({ title, movies, type }: ContentRowProps) {
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
    const scrollAmount = rowRef.current.clientWidth * 0.8;
    rowRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!movies?.length) return null;

  return (
    <div className="relative mb-8 lg:mb-10 group/row">
      {/* Netflix-style section title */}
      <h2 className="text-white text-lg lg:text-xl font-medium mb-3 px-[4%] hover:text-white/70 transition-colors cursor-pointer inline-block">
        {title}
        <span className="inline-block ml-2 text-xs text-[#54b9c5] opacity-0 group-hover/row:opacity-100 transition-opacity">
          Explore All ›
        </span>
      </h2>

      <div className="relative">
        {/* Left chevron - Netflix style */}
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

        {/* Cards - Netflix spacing */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-2 overflow-x-auto hide-scrollbar scroll-smooth px-[4%] pb-2"
        >
          {movies.map((movie) => (
            <div key={`${type}-${movie.id}`} className="flex-shrink-0 w-[160px] sm:w-[180px] lg:w-[200px]">
              <ContentCard movie={movie} type={type} />
            </div>
          ))}
        </div>

        {/* Right chevron - Netflix style */}
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
