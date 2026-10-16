import { getMoviesByGenre, getTVByGenre, getMovieGenres, getTVGenres } from '@/lib/tmdb';
import ContentCard from '@/components/ContentCard';
import GenreList from '@/components/GenreList';

export const runtime = 'edge';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const genreId = Number(id);
  const [movieGenres, tvGenres] = await Promise.all([getMovieGenres(), getTVGenres()]);
  const allGenres = [...movieGenres.genres, ...tvGenres.genres];
  const genre = allGenres.find((g) => g.id === genreId);
  return { title: `${genre?.name || 'Genre'} - LUNIFLEX` };
}

export default async function GenrePage({ params }: Props) {
  const { id } = await params;
  const genreId = Number(id);
  const [movies, tvShows, movieGenres, tvGenres] = await Promise.all([
    getMoviesByGenre(genreId),
    getTVByGenre(genreId),
    getMovieGenres(),
    getTVGenres(),
  ]);

  const allGenres = [...movieGenres.genres, ...tvGenres.genres].filter(
    (g, i, arr) => arr.findIndex((x) => x.id === g.id) === i
  );
  const genreName = allGenres.find((g) => g.id === genreId)?.name || 'Genre';

  return (
    <div className="pt-24 lg:pt-28 page-enter min-h-screen">
      <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-14">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">{genreName}</h1>

        <div className="mb-10">
          <GenreList genres={allGenres} activeGenreId={genreId} />
        </div>

        {movies.results.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-semibold text-white mb-5">Movies</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
              {movies.results.map((m, i) => (
                <ContentCard key={m.id} movie={m} type="movie" index={i} />
              ))}
            </div>
          </section>
        )}

        {tvShows.results.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-semibold text-white mb-5">Series</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
              {tvShows.results.map((s, i) => (
                <ContentCard key={s.id} movie={s} type="tv" index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
