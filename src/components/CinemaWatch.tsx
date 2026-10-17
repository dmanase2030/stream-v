'use client';

import { useRouter } from 'next/navigation';
import WatchSection from '@/components/WatchSection';
import { Season } from '@/types';

interface CinemaWatchProps {
  type: 'movie' | 'tv';
  id: number;
  season?: number;
  episode?: number;
  title: string;
  backdrop: string | null;
  posterPath: string | null;
  overview: string;
  voteAverage: number;
  runtime?: number;
  nextEpisodeUrl?: string | null;
  nextEpisodeLabel?: string;
  seasons?: Season[];
  detailHref: string;
}

export default function CinemaWatch({
  type, id, season, episode, title, backdrop, posterPath,
  overview, voteAverage, runtime, nextEpisodeUrl, nextEpisodeLabel,
  seasons, detailHref,
}: CinemaWatchProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push(detailHref);
  };

  return (
    <WatchSection
      type={type}
      id={id}
      season={season}
      episode={episode}
      title={title}
      backdrop={backdrop}
      posterPath={posterPath}
      overview={overview}
      voteAverage={voteAverage}
      runtime={runtime}
      nextEpisodeUrl={nextEpisodeUrl}
      nextEpisodeLabel={nextEpisodeLabel}
      seasons={seasons}
      cinemaMode={true}
      onBack={handleBack}
    />
  );
}
