'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/types';
import { getBackdropUrl, getImageUrl } from '@/lib/tmdb';
import { isInMyList, toggleMyList } from '@/lib/myList';

interface TitleModalProps {
  movie: Movie | null;
  type: 'movie' | 'tv';
  onClose: () => void;
}

export default function TitleModal({ movie, type, onClose }: TitleModalProps) {
  const [visible, setVisible] = useState(false);
  const [inList, setInList] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [cast, setCast] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (movie) {
      setVisible(true);
      setInList(isInMyList(movie.id));
      setShowTrailer(false);
      setTrailerKey(null);
      setCast([]);
      setCopied(false);
      try {
        if (localStorage.getItem('luniflex_trailer_autoplay') === '1') {
          setShowTrailer(true);
        }
      } catch {}
      fetch(`https://api.themoviedb.org/3/${type}/${movie.id}/videos?api_key=3ea9ba88a81be0f283362871b7f6b19e`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          const vids = d?.results || [];
          const trailer =
            vids.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer') ||
            vids.find((v: any) => v.site === 'YouTube');
          if (trailer) setTrailerKey(trailer.key);
        })
        .catch(() => {});
      fetch(`https://api.themoviedb.org/3/${type}/${movie.id}/credits?api_key=3ea9ba88a81be0f283362871b7f6b19e`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.cast) setCast(d.cast.slice(0, 8));
        })
        .catch(() => {});
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

        {/* Hero image / trailer */}
        <div className="relative aspect-video">
          {showTrailer && trailerKey ? (
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              title="Trailer"
            />
          ) : backdrop ? (
            <Image src={backdrop} alt={title} fill className="object-cover" sizes="850px" priority />
          ) : (
            <div className="w-full h-full bg-[#2a2a2a]" />
          )}
          {!showTrailer && <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />}

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
              <button
                onClick={() => {
                  const url = `${window.location.origin}/${type}/${movie.id}`;
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(url).then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }).catch(() => {});
                  }
                }}
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold px-5 py-2 rounded transition backdrop-blur-sm"
                aria-label="Share"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {copied ? 'Copied!' : 'Share'}
              </button>
              {trailerKey && (
                <button
                  onClick={() => setShowTrailer((s) => !s)}
                  className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold px-5 py-2 rounded transition backdrop-blur-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 7.5s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.4-1C16.6 4 12 4 12 4s-4.6 0-7.7.2c-.5.1-1.5.1-2.4 1-.7.7-.9 2.3-.9 2.3S.8 9.4.8 11.3v1.4c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.9.9 2 .9 2.6 1 1.9.2 7.5.2 7.5.2s4.6 0 7.7-.2c.5-.1 1.5-.1 2.4-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8v-1.4c0-1.9-.2-3.8-.2-3.8zM9.8 15.1V8.4l6.2 3.4-6.2 3.3z" />
                  </svg>
                  {showTrailer ? 'Hide Trailer' : 'Trailer'}
                </button>
              )}
              <button
                onClick={() => movie && setInList(toggleMyList({ ...movie, media_type: type } as any))}
                className="w-11 h-11 rounded-full border-2 border-white/40 hover:border-white flex items-center justify-center transition"
                aria-label={inList ? 'Remove from My List' : 'Add to My List'}
              >
                {inList ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M12 4v16m8-8H4" />
                  </svg>
                )}
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
          {cast.length > 0 && (
            <div className="mb-6">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Cast</p>
              <div className="flex flex-wrap gap-2">
                {cast.map((p: any) => (
                  <Link
                    key={p.id}
                    href={`/person/${p.id}`}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-xs text-white/80 transition"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
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
