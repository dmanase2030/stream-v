import { getTrending, getPopularMovies, getTopRatedMovies, getPopularTV, getTopRatedTV, getNowPlayingMovies } from '@/lib/tmdb';
import { fetchMyTVMovies, fetchMyTVSeries } from '@/lib/mytvMovies';
import HeroBanner from '@/components/HeroBanner';
import ContentRow from '@/components/ContentRow';
import Top10Row from '@/components/Top10Row';
import LandscapeRow from '@/components/LandscapeRow';
import ContinueWatchingRow, { HeroLastWatched } from '@/components/ContinueWatching';
import { MyTVMovieRow, MyTVSeriesRow } from '@/components/MyTVContentRow';
import { TMDBResponse, Movie } from '@/types';

export const runtime = 'edge';

export const dynamic = 'force-dynamic';

const empty: TMDBResponse<Movie> = { page: 1, results: [], total_pages: 0, total_results: 0 };

export default async function HomePage() {
  let trending = empty, popularMovies = empty, topRatedMovies = empty,
      nowPlaying = empty, popularTV = empty, topRatedTV = empty;
  let mytvMovies: Awaited<ReturnType<typeof fetchMyTVMovies>> = { movies: [], categories: [], count: 0 };
  let mytvSeries: Awaited<ReturnType<typeof fetchMyTVSeries>> = { series: [], categories: [], count: 0 };

  try {
    [trending, popularMovies, topRatedMovies, nowPlaying, popularTV, topRatedTV] = await Promise.all([
      getTrending('week'),
      getPopularMovies(),
      getTopRatedMovies(),
      getNowPlayingMovies(),
      getPopularTV(),
      getTopRatedTV(),
    ]);
  } catch (e) {
    console.error('Failed to fetch TMDB data:', e);
  }

  try {
    [mytvMovies, mytvSeries] = await Promise.all([
      fetchMyTVMovies(undefined, 20),
      fetchMyTVSeries(undefined, 20),
    ]);
  } catch (e) {
    console.error('Failed to fetch MyTV+ data:', e);
  }

  const heroMovie = trending.results[0];

  return (
    <div className="bg-[#141414] min-h-screen">
      <HeroLastWatched
        fallbackHero={heroMovie ? <HeroBanner movie={heroMovie} /> : null}
      />

      {/* Netflix-style rows pulled up over hero */}
      <div className="-mt-32 relative z-10 pb-10">
        <ContinueWatchingRow />
        <ContentRow title="Trending Now" movies={trending.results.slice(1, 20)} />
        <Top10Row title="Top 10 Movies Today" movies={topRatedMovies.results} type="movie" />
        <Top10Row title="Top 10 TV Shows Today" movies={topRatedTV.results} type="tv" />
        <LandscapeRow title="Crowd Pleasers" movies={popularMovies.results.slice(0, 15)} type="movie" />
        <ContentRow title="Popular Movies" movies={popularMovies.results} type="movie" />
        <ContentRow title="Popular TV Shows" movies={popularTV.results} type="tv" />
        <ContentRow title="Top Rated Series" movies={topRatedTV.results} type="tv" />
        <ContentRow title="Now Playing" movies={nowPlaying.results} type="movie" />
        <MyTVMovieRow title="MyTV+ Movies" movies={mytvMovies.movies.slice(0, 20)} />
        <MyTVSeriesRow title="MyTV+ Series" series={mytvSeries.series.slice(0, 20)} />
      </div>
    </div>
  );
}
