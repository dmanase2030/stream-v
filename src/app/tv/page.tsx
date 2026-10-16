import { getPopularTV, getTopRatedTV, getAiringTodayTV, getTVGenres } from '@/lib/tmdb';
import ContentRow from '@/components/ContentRow';
import GenreList from '@/components/GenreList';
import { TMDBResponse, Movie } from '@/types';

export const runtime = 'edge';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Series - SAHND+' };

const empty: TMDBResponse<Movie> = { page: 1, results: [], total_pages: 0, total_results: 0 };

export default async function TVPage() {
  let popular = empty, topRated = empty, airingToday = empty;
  let genres: { genres: { id: number; name: string }[] } = { genres: [] };

  try {
    [popular, topRated, airingToday, genres] = await Promise.all([
      getPopularTV(),
      getTopRatedTV(),
      getAiringTodayTV(),
      getTVGenres(),
    ]);
  } catch (e) {
    console.error('Failed to fetch TV:', e);
  }

  return (
    <div className="pt-24 lg:pt-28 page-enter">
      <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-14 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Series</h1>
        <p className="text-white/40 text-sm mb-6">Binge-worthy shows and must-watch television.</p>
        <GenreList genres={genres.genres} />
      </div>

      <ContentRow title="Popular Series" movies={popular.results} type="tv" />
      <ContentRow title="Airing Today" movies={airingToday.results} type="tv" />
      <ContentRow title="Top Rated" movies={topRated.results} type="tv" />
    </div>
  );
}
