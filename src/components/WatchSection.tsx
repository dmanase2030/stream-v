'use client';

import { useState } from 'react';
import HlsVideoPlayer from '@/components/HlsVideoPlayer';
import EpisodeSidebar from '@/components/EpisodeSidebar';
import { Season } from '@/types';

interface WatchSectionProps {
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
  cinemaMode?: boolean;
  onBack?: () => void;
}

export default function WatchSection({
  type, id, season, episode, title, backdrop, posterPath, overview, voteAverage,
  runtime, nextEpisodeUrl, nextEpisodeLabel, seasons, cinemaMode = false, onBack,
}: WatchSectionProps) {
  const [autoNext, setAutoNext] = useState(() => {
    try {
      const v = localStorage.getItem('luniflex_autoplay');
      return v === null ? true : v === '1';
    } catch {
      return true;
    }
  });
  const isTV = type === 'tv';

  return (
    <div className={`flex gap-4 ${isTV ? 'flex-col xl:flex-row' : ''}`}>
      {/* Player Column */}
      <div className={isTV ? 'flex-1 min-w-0' : 'w-full'}>
        <HlsVideoPlayer
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
          autoNext={autoNext}
          cinemaMode={cinemaMode}
          onBack={onBack}
          seasons={seasons}
        />
      </div>

      {/* Episode Sidebar (TV only) */}
      {isTV && season && seasons && (
        <div className="xl:w-[380px] flex-shrink-0">
          <EpisodeSidebar
            tvId={id}
            currentSeason={season}
            currentEpisode={episode || 1}
            seasons={seasons}
            showTitle={title}
            autoNext={autoNext}
            onAutoNextChange={setAutoNext}
          />
        </div>
      )}
    </div>
  );
}
