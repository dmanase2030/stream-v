import { getTrending, getPopularMovies, getTopRatedMovies, getPopularTV, getTopRatedTV, getNowPlayingMovies } from '@/lib/tmdb';
import { fetchMyTVMovies, fetchMyTVSeries } from '@/lib/mytvMovies';
import HeroBanner from '@/components/HeroBanner';
import ContentRow from '@/components/ContentRow';
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
    <div className="page-enter">
      <HeroLastWatched
        fallbackHero={heroMovie ? <HeroBanner movie={heroMovie} /> : null}
      />

      <div className="-mt-20 relative z-10">
        <ContinueWatchingRow />
        <ContentRow title="Trending Movies" movies={trending.results.slice(1, 20)} />
        <ContentRow title="Popular Movies" movies={popularMovies.results} type="movie" />
        <ContentRow title="Now Playing" movies={nowPlaying.results} type="movie" />
        <ContentRow title="Top Rated" movies={topRatedMovies.results} type="movie" />
        <ContentRow title="Popular Series" movies={popularTV.results} type="tv" />
        <ContentRow title="Top Rated Series" movies={topRatedTV.results} type="tv" />
        <MyTVMovieRow title="MyTV+ Movies" movies={mytvMovies.movies.slice(0, 20)} />
        <MyTVSeriesRow title="MyTV+ Series" series={mytvSeries.series.slice(0, 20)} />
      </div>
    </div>
  );
}
