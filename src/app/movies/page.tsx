import { getPopularMovies, getTopRatedMovies, getNowPlayingMovies, getUpcomingMovies, getMovieGenres } from '@/lib/tmdb';
import ContentRow from '@/components/ContentRow';
import GenreList from '@/components/GenreList';
import { TMDBResponse, Movie } from '@/types';

export const runtime = 'edge';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Movies - SAHND+' };

const empty: TMDBResponse<Movie> = { page: 1, results: [], total_pages: 0, total_results: 0 };

export default async function MoviesPage() {
  let popular = empty, topRated = empty, nowPlaying = empty, upcoming = empty;
  let genres: { genres: { id: number; name: string }[] } = { genres: [] };

  try {
    [popular, topRated, nowPlaying, upcoming, genres] = await Promise.all([
      getPopularMovies(),
      getTopRatedMovies(),
      getNowPlayingMovies(),
      getUpcomingMovies(),
      getMovieGenres(),
    ]);
  } catch (e) {
    console.error('Failed to fetch movies:', e);
  }

  return (
    <div className="pt-24 lg:pt-28 page-enter">
      <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-14 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Movies</h1>
        <p className="text-white/40 text-sm mb-6">Discover the latest and greatest films.</p>
        <GenreList genres={genres.genres} />
      </div>

      <ContentRow title="Popular Right Now" movies={popular.results} type="movie" />
      <ContentRow title="Now in Theaters" movies={nowPlaying.results} type="movie" />
      <ContentRow title="Top Rated" movies={topRated.results} type="movie" />
      <ContentRow title="Coming Soon" movies={upcoming.results} type="movie" />
    </div>
  );
}
