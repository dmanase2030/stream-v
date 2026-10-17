import Link from 'next/link';
import { getMovieDetail, getTVDetail, getBackdropUrl, getSeasonDetail } from '@/lib/tmdb';
import CinemaWatch from '@/components/CinemaWatch';
import { MovieDetail } from '@/types';

export const runtime = 'edge';

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
      return { title: `Watch ${movie.title} - LUNIFLEX` };
    } else {
      const show = await getTVDetail(Number(id));
      const s = sp.s || '1';
      const e = sp.e || '1';
      return { title: `Watch ${show.name} S${s}E${e} - LUNIFLEX` };
    }
  } catch {
    return { title: 'Watch - LUNIFLEX' };
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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-4xl mb-4 text-white font-bold">CONTENT NOT FOUND</h1>
          <Link href="/" className="text-[#E50914] hover:underline">Go Home</Link>
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
    <CinemaWatch
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
      detailHref={detailHref}
    />
  );
}
