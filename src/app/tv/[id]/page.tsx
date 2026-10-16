import Image from 'next/image';
import Link from 'next/link';
import { getTVDetail, getImageUrl, getBackdropUrl } from '@/lib/tmdb';
import CastRow from '@/components/CastRow';
import ContentRow from '@/components/ContentRow';
import WatchlistButton from '@/components/WatchlistButton';
import SeasonSelector from '@/components/SeasonSelector';
import SmartWatchButton from '@/components/SmartWatchButton';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const show = await getTVDetail(Number(id));
  return { title: `${show.name} - SAHND+` };
}

export default async function TVDetailPage({ params }: Props) {
  const { id } = await params;
  const show = await getTVDetail(Number(id));
  const backdrop = getBackdropUrl(show.backdrop_path);
  const year = show.first_air_date?.slice(0, 4);
  const title = show.name || show.title;
  const trailer = show.videos?.results?.find((v) => v.type === 'Trailer' && v.site === 'YouTube');

  return (
    <div className="page-enter">
      {/* Backdrop */}
      <div className="relative w-full h-[65vh] min-h-[450px]">
        {backdrop && (
          <Image src={backdrop} alt={title} fill className="object-cover object-top" sizes="100vw" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/80 via-bg-primary/30 to-transparent" />
      </div>

      <div className="relative -mt-64 z-10 max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-14">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          <div className="flex-shrink-0 w-44 sm:w-52 lg:w-64 mx-auto lg:mx-0">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/5">
              <Image src={getImageUrl(show.poster_path, 'w500')} alt={title} fill className="object-cover" sizes="256px" />
            </div>
          </div>

          <div className="flex-1 min-w-0 pt-4 lg:pt-20">
            {show.tagline && (
              <p className="text-white/30 text-sm italic mb-2">&ldquo;{show.tagline}&rdquo;</p>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">{title}</h1>

            <div className="flex items-center gap-3 flex-wrap mb-5 text-sm">
              <span className="flex items-center gap-1.5 text-yellow-400 font-semibold">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {show.vote_average.toFixed(1)}
              </span>
              {year && <span className="text-white/30">{year}</span>}
              {show.number_of_seasons && (
                <span className="text-white/30">{show.number_of_seasons} Season{show.number_of_seasons > 1 ? 's' : ''}</span>
              )}
              <span className="px-2.5 py-0.5 text-[11px] font-medium bg-white/5 rounded-full text-white/30">{show.status}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {show.genres?.map((g) => (
                <Link key={g.id} href={`/genre/${g.id}`} className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70 transition-all">
                  {g.name}
                </Link>
              ))}
            </div>

            <p className="text-white/50 text-sm leading-relaxed mb-7 max-w-2xl">{show.overview}</p>

            <div className="flex items-center gap-3 flex-wrap mb-10">
              <SmartWatchButton tvId={show.id} totalSeasons={show.number_of_seasons} />
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
                item={{ id: show.id, type: 'tv', title, poster_path: show.poster_path, vote_average: show.vote_average, addedAt: 0 }}
              />
            </div>

            {show.credits?.cast && <CastRow cast={show.credits.cast} />}
            {show.seasons && show.seasons.length > 0 && (
              <SeasonSelector tvId={show.id} seasons={show.seasons} />
            )}
          </div>
        </div>

        <div className="mt-12">
          {show.similar?.results && show.similar.results.length > 0 && (
            <ContentRow title="More Like This" movies={show.similar.results} type="tv" />
          )}
        </div>
      </div>
    </div>
  );
}
