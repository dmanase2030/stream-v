import Image from 'next/image';
import Link from 'next/link';
import { getMovieDetail, getImageUrl, getBackdropUrl } from '@/lib/tmdb';
import CastRow from '@/components/CastRow';
import ContentRow from '@/components/ContentRow';
import WatchlistButton from '@/components/WatchlistButton';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const movie = await getMovieDetail(Number(id));
  return { title: `${movie.title} - SAHND+` };
}

export default async function MovieDetailPage({ params }: Props) {
  const { id } = await params;
  const movie = await getMovieDetail(Number(id));
  const backdrop = getBackdropUrl(movie.backdrop_path);
  const year = movie.release_date?.slice(0, 4);
  const hours = movie.runtime ? Math.floor(movie.runtime / 60) : 0;
  const mins = movie.runtime ? movie.runtime % 60 : 0;
  const director = movie.credits?.crew?.find((c) => c.job === 'Director');
  const trailer = movie.videos?.results?.find((v) => v.type === 'Trailer' && v.site === 'YouTube');

  return (
    <div className="page-enter">
      {/* Backdrop */}
      <div className="relative w-full h-[65vh] min-h-[450px]">
        {backdrop && (
          <Image src={backdrop} alt={movie.title} fill className="object-cover object-top" sizes="100vw" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/80 via-bg-primary/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative -mt-64 z-10 max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-14">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Poster */}
          <div className="flex-shrink-0 w-44 sm:w-52 lg:w-64 mx-auto lg:mx-0">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/5">
              <Image src={getImageUrl(movie.poster_path, 'w500')} alt={movie.title} fill className="object-cover" sizes="256px" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-4 lg:pt-20">
            {movie.tagline && (
              <p className="text-white/30 text-sm italic mb-2">&ldquo;{movie.tagline}&rdquo;</p>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              {movie.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-3 flex-wrap mb-5 text-sm">
              <span className="flex items-center gap-1.5 text-yellow-400 font-semibold">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {movie.vote_average.toFixed(1)}
              </span>
              {year && <span className="text-white/30">{year}</span>}
              {movie.runtime && movie.runtime > 0 && (
                <span className="text-white/30">{hours}h {mins}m</span>
              )}
              {director && <span className="text-white/20">Dir. {director.name}</span>}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-5">
              {movie.genres?.map((g) => (
                <Link
                  key={g.id}
                  href={`/genre/${g.id}`}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70 transition-all"
                >
                  {g.name}
                </Link>
              ))}
            </div>

            <p className="text-white/50 text-sm leading-relaxed mb-7 max-w-2xl">{movie.overview}</p>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-wrap mb-10">
              <Link
                href={`/watch/movie/${movie.id}`}
                className="inline-flex items-center gap-2.5 bg-white text-black font-semibold px-8 py-3 rounded-full transition-all hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                Watch Now
              </Link>
              {trailer && (
                <a
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium px-6 py-3 rounded-full transition-all backdrop-blur-md border border-white/5"
                >
                  Trailer
                </a>
              )}
              <WatchlistButton
                item={{
                  id: movie.id,
                  type: 'movie',
                  title: movie.title,
                  poster_path: movie.poster_path,
                  vote_average: movie.vote_average,
                  addedAt: 0,
                }}
              />
            </div>

            {movie.credits?.cast && <CastRow cast={movie.credits.cast} />}
          </div>
        </div>

        <div className="mt-12">
          {movie.similar?.results && movie.similar.results.length > 0 && (
            <ContentRow title="More Like This" movies={movie.similar.results} type="movie" />
          )}
          {movie.recommendations?.results && movie.recommendations.results.length > 0 && (
            <ContentRow title="Recommended" movies={movie.recommendations.results} type="movie" />
          )}
        </div>
      </div>
    </div>
  );
}
