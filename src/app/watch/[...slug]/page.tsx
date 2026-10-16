import Image from 'next/image';
import Link from 'next/link';
import { getMovieDetail, getTVDetail, getBackdropUrl, getImageUrl, getSeasonDetail } from '@/lib/tmdb';
import ContentRow from '@/components/ContentRow';
import WatchlistButton from '@/components/WatchlistButton';
import WatchSection from '@/components/WatchSection';
import { MovieDetail } from '@/types';

interface Props {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ s?: string; e?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const [type, id] = slug;
  try {
    if (type === 'movie') {
      const movie = await getMovieDetail(Number(id));
      return { title: `Watch ${movie.title} - SAHND+` };
    } else {
      const show = await getTVDetail(Number(id));
      const s = sp.s || '1';
      const e = sp.e || '1';
      return { title: `Watch ${show.name} S${s}E${e} - SAHND+` };
    }
  } catch {
    return { title: 'Watch - SAHND+' };
  }
}

export default async function WatchPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const [type, id] = slug;
  const mediaType = type as 'movie' | 'tv';
  const tmdbId = Number(id);
  const season = sp.s ? Number(sp.s) : undefined;
  const episode = sp.e ? Number(sp.e) : undefined;

  let detail: MovieDetail;
  try {
    detail = mediaType === 'movie'
      ? await getMovieDetail(tmdbId)
      : await getTVDetail(tmdbId);
  } catch {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl mb-4">CONTENT NOT FOUND</h1>
          <Link href="/" className="text-accent-red hover:underline">Go Home</Link>
        </div>
      </div>
    );
  }

  const title = detail.title || detail.name || '';
  const backdrop = getBackdropUrl(detail.backdrop_path);
  const detailHref = `/${mediaType}/${tmdbId}`;
  const year = (detail.release_date || detail.first_air_date || '').slice(0, 4);
  const isTV = mediaType === 'tv';

  // Fetch season data for TV to get runtime and next episode
  let currentRuntime: number | undefined;
  let nextEpisodeUrl: string | null = null;
  let nextEpisodeLabel: string | undefined;

  if (isTV && season) {
    try {
      const seasonData = await getSeasonDetail(tmdbId, season);
      const episodes = seasonData.episodes || [];
      const currentEp = episodes.find((ep) => ep.episode_number === (episode || 1));
      currentRuntime = currentEp?.runtime;

      // Find next episode
      const nextEp = episodes.find((ep) => ep.episode_number === (episode || 1) + 1);
      if (nextEp) {
        nextEpisodeUrl = `/watch/tv/${tmdbId}?s=${season}&e=${nextEp.episode_number}`;
        nextEpisodeLabel = `S${season} E${nextEp.episode_number} · ${nextEp.name}`;
      } else {
        // Check if there's a next season
        const validSeasons = (detail.seasons || []).filter((s) => s.season_number > 0);
        const nextSeason = validSeasons.find((s) => s.season_number === season + 1);
        if (nextSeason) {
          nextEpisodeUrl = `/watch/tv/${tmdbId}?s=${season + 1}&e=1`;
          nextEpisodeLabel = `S${season + 1} E1 · ${nextSeason.name}`;
        }
      }
    } catch {
      // Season data fetch failed, continue without it
    }
  } else if (mediaType === 'movie') {
    currentRuntime = detail.runtime;
  }

  return (
    <div className="min-h-screen page-enter bg-bg-primary">
      {/* Subtle background glow */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {backdrop && (
          <Image src={backdrop} alt="" fill className="object-cover opacity-[0.04] blur-3xl scale-125" sizes="100vw" />
        )}
      </div>

      <div className="pt-[72px] pb-12">
        {/* Top Bar */}
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={detailHref}
              className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-all group/back text-sm"
            >
              <svg className="w-4 h-4 group-hover/back:-translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to {title}
            </Link>
            <WatchlistButton
              item={{ id: detail.id, type: mediaType, title, poster_path: detail.poster_path, vote_average: detail.vote_average, addedAt: 0 }}
              variant="icon"
            />
          </div>
        </div>

        {/* Main Content: Player + Sidebar */}
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10">
          <WatchSection
            type={mediaType}
            id={tmdbId}
            season={season}
            episode={episode}
            title={title}
            backdrop={backdrop}
            posterPath={detail.poster_path}
            overview={detail.overview}
            voteAverage={detail.vote_average}
            runtime={currentRuntime}
            nextEpisodeUrl={nextEpisodeUrl}
            nextEpisodeLabel={nextEpisodeLabel}
            seasons={isTV ? detail.seasons : undefined}
          />
        </div>

        {/* Info Bar */}
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 mt-6">
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.04] p-5 lg:p-6">
            <div className="flex flex-col sm:flex-row gap-5">
              {/* Small Poster */}
              <div className="hidden sm:block flex-shrink-0 w-20">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden">
                  <Image src={getImageUrl(detail.poster_path, 'w185')} alt={title} fill className="object-cover" sizes="80px" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-1">
                  {title}
                  {season && episode && (
                    <span className="text-white/40 font-normal ml-2 text-lg">
                      Season {season}, Episode {episode}
                    </span>
                  )}
                </h1>

                <div className="flex items-center gap-2.5 flex-wrap mb-3">
                  <span className="flex items-center gap-1 text-yellow-400 text-sm font-semibold">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {detail.vote_average.toFixed(1)}
                  </span>
                  {year && <span className="text-white/30 text-sm">{year}</span>}
                  {currentRuntime && <span className="text-white/30 text-sm">{currentRuntime}min</span>}
                  {detail.genres?.slice(0, 3).map((g) => (
                    <Link key={g.id} href={`/genre/${g.id}`} className="text-xs text-white/30 hover:text-white/60 transition-colors">
                      {g.name}
                    </Link>
                  ))}
                </div>

                <p className="text-white/40 text-sm leading-relaxed line-clamp-2 max-w-3xl">{detail.overview}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Similar */}
        {detail.similar?.results && detail.similar.results.length > 0 && (
          <div className="mt-10">
            <ContentRow title="More Like This" movies={detail.similar.results} type={mediaType} />
          </div>
        )}
      </div>
    </div>
  );
}
