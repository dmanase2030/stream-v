'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Movie } from '@/types';
import { getImageUrl } from '@/lib/tmdb';
import { isWatched, getProgress } from '@/lib/history';
import { isInMyList, toggleMyList } from '@/lib/myList';

interface ContentCardProps {
  movie: Movie;
  type?: 'movie' | 'tv';
  index?: number;
}

export default function ContentCard({ movie, type, index = 0 }: ContentCardProps) {
  const title = movie.title || movie.name || '';
  const mediaType = type || (movie.media_type === 'tv' || movie.first_air_date ? 'tv' : 'movie');
  const year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
  const rating = movie.vote_average?.toFixed(1);
  const [watched, setWatched] = useState(false);
  const [progress, setProgress] = useState(0);
  const [inList, setInList] = useState(false);

  useEffect(() => {
    setWatched(isWatched(movie.id, mediaType as 'movie' | 'tv'));
    setProgress(getProgress(movie.id, mediaType as 'movie' | 'tv'));
    setInList(isInMyList(movie.id));
  }, [movie.id, mediaType]);

  return (
    <Link
      href={`/${mediaType}/${movie.id}`}
      className="block w-full group/card"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="relative aspect-video rounded-md overflow-hidden bg-[#2a2a2a] transition-all duration-300 group-hover/card:scale-[1.04] group-hover/card:z-10 group-hover/card:shadow-2xl group-hover/card:shadow-black/60 cursor-pointer">
        <Image
          src={getImageUrl(movie.backdrop_path || movie.poster_path, 'w500')}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 240px, (max-width: 1024px) 280px, 300px"
        />
        {/* Quick add to My List */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setInList(toggleMyList({ ...movie, media_type: mediaType } as any));
          }}
          aria-label={inList ? 'Remove from My List' : 'Add to My List'}
          className={`absolute top-1.5 right-1.5 z-10 w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
            inList
              ? 'bg-white border-white opacity-100'
              : 'bg-black/60 border-white/50 opacity-0 group-hover/card:opacity-100 hover:border-white'
          }`}
        >
          {inList ? (
            <svg className="w-3.5 h-3.5 text-black" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M12 5v14M5 12h14" />
            </svg>
          )}
        </button>
        {/* Brand badge */}
        <div className="absolute top-1.5 left-1.5 z-10">
          <span className="text-[#E50914] font-black text-sm leading-none drop-shadow-md" style={{ fontFamily: 'Arial Black, sans-serif' }}>R</span>
        </div>
        {/* Netflix-style hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <p className="text-white text-xs font-semibold line-clamp-2 mb-1">{title}</p>
          <div className="flex items-center gap-2 text-[10px] text-white/70">
            {rating && parseFloat(rating) > 0 && (
              <span className="text-green-400 font-semibold">{rating}</span>
            )}
            {year && <span>{year}</span>}
          </div>
          {/* Play on hover */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center scale-75 group-hover/card:scale-100 transition-transform duration-300">
              <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
        {/* Watched badge */}
        {watched && (
          <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[#46d369] flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {/* Netflix red progress bar */}
        {progress > 0 && progress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20">
            <div className="h-full bg-[#E50914]" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </Link>
  );
}
