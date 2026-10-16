'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/types';
import { getBackdropUrl, getImageUrl } from '@/lib/tmdb';

interface TitleModalProps {
  movie: Movie | null;
  type: 'movie' | 'tv';
  onClose: () => void;
}

export default function TitleModal({ movie, type, onClose }: TitleModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (movie) {
      setVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [movie]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  if (!movie) return null;

  const title = movie.title || movie.name || '';
  const year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
  const rating = movie.vote_average ? Math.round(movie.vote_average * 10) : null;
  const backdrop = getBackdropUrl(movie.backdrop_path);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto py-8 px-4 transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70" onClick={handleClose} />

      {/* Modal - Netflix style */}
      <div
        className={`relative w-full max-w-[850px] bg-[#181818] rounded-lg overflow-hidden shadow-2xl transition-all duration-200 ${
          visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#181818] flex items-center justify-center hover:bg-[#2a2a2a] transition"
          aria-label="Close"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Hero image */}
        <div className="relative aspect-video">
          {backdrop ? (
            <Image src={backdrop} alt={title} fill className="object-cover" sizes="850px" priority />
          ) : (
            <div className="w-full h-full bg-[#2a2a2a]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />

          {/* Title + buttons over image */}
          <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">{title}</h2>
            <div className="flex items-center gap-3">
              <Link
                href={`/watch/${type}/${movie.id}`}
                className="inline-flex items-center gap-2 bg-white hover:bg-white/80 text-black font-bold px-7 py-2 rounded transition"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play
              </Link>
              <button className="w-11 h-11 rounded-full border-2 border-white/40 hover:border-white flex items-center justify-center transition" aria-label="Add to My List">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button className="w-11 h-11 rounded-full border-2 border-white/40 hover:border-white flex items-center justify-center transition" aria-label="Like">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-8 sm:p-12 pt-4">
          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
            {rating && <span className="text-[#46d369] font-semibold">{rating}% Match</span>}
            {year && <span className="text-white">{year}</span>}
            <span className="border border-white/40 text-white/70 text-xs px-1.5 py-0.5">HD</span>
            <span className="border border-white/40 text-white/70 text-xs px-1.5 py-0.5">TV-MA</span>
          </div>
          <p className="text-white text-sm leading-relaxed mb-6">{movie.overview}</p>
          <Link
            href={`/${type}/${movie.id}`}
            className="inline-flex items-center text-white text-sm font-medium hover:underline"
          >
            More details
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
