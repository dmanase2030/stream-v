import { getTrending, getPopularMovies, getTopRatedMovies, getPopularTV, getTopRatedTV, getNowPlayingMovies } from '@/lib/tmdb';
import { fetchMyTVMovies, fetchMyTVSeries } from '@/lib/mytvMovies';
import HomeRows from '@/components/HomeRows';
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

  return (
    <HomeRows
      trending={trending.results}
      popularMovies={popularMovies.results}
      topRatedMovies={topRatedMovies.results}
      nowPlaying={nowPlaying.results}
      popularTV={popularTV.results}
      topRatedTV={topRatedTV.results}
      mytvMovies={mytvMovies.movies.slice(0, 20)}
      mytvSeries={mytvSeries.series.slice(0, 20)}
    />
  );
}
