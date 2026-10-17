import Link from 'next/link';
import Image from 'next/image';
import { Movie } from '@/types';
import { getBackdropUrl } from '@/lib/tmdb';

interface HeroBannerProps {
  movie: Movie;
}

export default function HeroBanner({ movie }: HeroBannerProps) {
  const title = movie.title || movie.name || '';
  const type = movie.media_type === 'tv' || movie.first_air_date ? 'tv' : 'movie';
  const backdrop = getBackdropUrl(movie.backdrop_path);

  return (
    <div className="relative w-full h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Backdrop Image */}
      {backdrop && (
        <Image
          src={backdrop}
          alt={title}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      )}

      {/* Netflix-style gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />

      {/* Content - Netflix billboard style */}
      <div className="absolute inset-0 flex items-center">
        <div className="px-[4%] w-full max-w-[1800px]">
          <div className="max-w-xl">
            {/* Netflix N SERIES eyebrow */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#E50914] font-black text-xl tracking-tighter">L</span>
              <span className="text-white/90 text-sm font-medium tracking-[0.2em] uppercase">
                {type === 'tv' ? 'Series' : 'Film'}
              </span>
            </div>

            {/* Title - big bold like Netflix */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-4 drop-shadow-2xl">
              {title}
            </h1>

            {/* Top 10 badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center bg-[#E50914] text-white text-xs font-bold px-2 py-1 rounded">
                <span className="mr-1">TOP</span>
                <span className="text-lg leading-none">10</span>
              </div>
              <span className="text-white text-sm font-medium">#1 in Movies Today</span>
            </div>

            {/* Overview */}
            <p className="text-white text-base sm:text-lg leading-relaxed mb-6 line-clamp-3 drop-shadow-lg max-w-lg">
              {movie.overview}
            </p>

            {/* Netflix-style buttons */}
            <div className="flex items-center gap-3">
              <Link
                href={`/watch/${type}/${movie.id}`}
                className="inline-flex items-center gap-2.5 bg-white hover:bg-white/80 text-black font-bold text-lg px-8 py-2.5 rounded transition-all duration-200"
              >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play
              </Link>
              <Link
                href={`/${type}/${movie.id}`}
                className="inline-flex items-center gap-2.5 bg-[#6d6d6e]/70 hover:bg-[#6d6d6e]/40 text-white font-bold text-lg px-8 py-2.5 rounded transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" d="M12 16v-4M12 8h.01" />
                </svg>
                More Info
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Maturity rating - bottom right like Netflix */}
      <div className="absolute bottom-[25%] right-0 flex items-center">
        <div className="border-l-[3px] border-white bg-black/30 pl-3 pr-10 py-1.5">
          <span className="text-white text-sm">TV-MA</span>
        </div>
      </div>
    </div>
  );
}
