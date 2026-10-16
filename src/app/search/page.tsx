import { searchMulti, getMovieGenres, getTVGenres } from '@/lib/tmdb';
import ContentCard from '@/components/ContentCard';
import Link from 'next/link';

export const runtime = 'edge';

export const metadata = { title: 'Search - LUNIFLEX' };

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q || '';
  const results = query ? await searchMulti(query) : null;
  const [movieGenres, tvGenres] = await Promise.all([getMovieGenres(), getTVGenres()]);
  const allGenres = [...movieGenres.genres, ...tvGenres.genres].filter(
    (g, i, arr) => arr.findIndex((x) => x.id === g.id) === i
  );

  const filtered = results?.results.filter(
    (r) => r.media_type !== 'person' && (r.poster_path || r.backdrop_path)
  );

  return (
    <div className="pt-24 lg:pt-28 page-enter min-h-screen">
      <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-14">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">Search</h1>

        {/* Search Form */}
        <form action="/search" method="GET" className="max-w-2xl mb-8">
          <div className="relative">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search movies, series, people..."
              className="w-full bg-white/5 border border-white/[0.06] rounded-2xl px-5 py-4 pl-12 text-white placeholder-white/20 focus:outline-none focus:border-white/15 focus:bg-white/[0.07] transition-all text-base"
              autoFocus={!query}
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
        </form>

        {/* Genre Quick Links */}
        {!query && (
          <div className="flex flex-wrap gap-2 mb-10">
            {allGenres.slice(0, 15).map((g) => (
              <Link
                key={g.id}
                href={`/genre/${g.id}`}
                className="px-4 py-2 rounded-full text-xs font-medium bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70 transition-all"
              >
                {g.name}
              </Link>
            ))}
          </div>
        )}

        {/* Results */}
        {query && filtered && (
          <div>
            <p className="text-white/30 text-sm mb-6">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
            </p>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                {filtered.map((movie, i) => (
                  <ContentCard key={movie.id} movie={movie} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-white/40 text-base mb-1">No results found</p>
                <p className="text-white/20 text-sm">Try different keywords</p>
              </div>
            )}
          </div>
        )}

        {!query && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
              <svg className="w-7 h-7 text-white/15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <p className="text-white/40 text-base mb-1">Find your next watch</p>
            <p className="text-white/20 text-sm">Search for movies, series, and more</p>
          </div>
        )}
      </div>
    </div>
  );
}
