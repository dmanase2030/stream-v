'use client';

import { useEffect, useState } from 'react';
import HeroBanner from '@/components/HeroBanner';
import ContentRow from '@/components/ContentRow';
import Top10Row from '@/components/Top10Row';
import LandscapeRow from '@/components/LandscapeRow';
import ContinueWatchingRow, { HeroLastWatched } from '@/components/ContinueWatching';
import { MyTVMovieRow, MyTVSeriesRow } from '@/components/MyTVContentRow';
import { getHiddenRows, getHeroPick, HeroPick } from '@/lib/siteConfig';
import { Movie } from '@/types';

const TMDB_KEY = '3ea9ba88a81be0f283362871b7f6b19e';

interface HomeRowsProps {
  trending: Movie[];
  popularMovies: Movie[];
  topRatedMovies: Movie[];
  nowPlaying: Movie[];
  popularTV: Movie[];
  topRatedTV: Movie[];
  mytvMovies: any[];
  mytvSeries: any[];
}

export default function HomeRows(data: HomeRowsProps) {
  const [hiddenRows, setHiddenRows] = useState<string[]>([]);
  const [overrideMovie, setOverrideMovie] = useState<Movie | null>(null);

  useEffect(() => {
    setHiddenRows(getHiddenRows());
    const pick: HeroPick | null = getHeroPick();
    if (pick) {
      fetch(`https://api.themoviedb.org/3/${pick.type}/${pick.id}?api_key=${TMDB_KEY}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((m) => {
          if (m) setOverrideMovie(m);
        })
        .catch(() => {});
    }
  }, []);

  const heroMovie = overrideMovie || data.trending[0];
  const hidden = (id: string) => hiddenRows.includes(id);

  return (
    <div className="bg-black min-h-screen">
      <HeroLastWatched
        fallbackHero={heroMovie ? <HeroBanner movie={heroMovie} /> : null}
      />

      {/* Netflix-style rows pulled up over hero */}
      <div className="-mt-32 relative z-10 pb-10">
        {!hidden('continue') && <ContinueWatchingRow />}
        {!hidden('trending') && <ContentRow title="Trending Now" movies={data.trending.slice(1, 20)} />}
        {!hidden('top10movies') && <Top10Row title="Top 10 Movies Today" movies={data.topRatedMovies} type="movie" />}
        {!hidden('top10tv') && <Top10Row title="Top 10 TV Shows Today" movies={data.topRatedTV} type="tv" />}
        {!hidden('crowd') && <LandscapeRow title="Crowd Pleasers" movies={data.popularMovies.slice(0, 15)} type="movie" />}
        {!hidden('popular-movies') && <ContentRow title="Popular Movies" movies={data.popularMovies} type="movie" />}
        {!hidden('popular-tv') && <ContentRow title="Popular TV Shows" movies={data.popularTV} type="tv" />}
        {!hidden('top-rated-series') && <ContentRow title="Top Rated Series" movies={data.topRatedTV} type="tv" />}
        {!hidden('now-playing') && <ContentRow title="Now Playing" movies={data.nowPlaying} type="movie" />}
        {!hidden('mytv-movies') && <MyTVMovieRow title="MyTV+ Movies" movies={data.mytvMovies} />}
        {!hidden('mytv-series') && <MyTVSeriesRow title="MyTV+ Series" series={data.mytvSeries} />}
      </div>
    </div>
  );
}
