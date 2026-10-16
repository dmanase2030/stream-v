import { fetchMyTVSerie } from '@/lib/mytvMovies';

export const runtime = 'edge';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function MyTVSeriesPage({ params }: PageProps) {
  const { id } = await params;
  let serie = null;
  let error = '';

  try {
    serie = await fetchMyTVSerie(id);
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : 'Failed to load series';
  }

  if (!serie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 text-lg mb-4">{error || 'Series not found'}</p>
          <a href="/mytv" className="text-purple-400 hover:underline text-sm">Back to MyTV+</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-enter">
      {/* Backdrop */}
      <div className="relative h-[50vh] min-h-[400px]">
        {serie.poster ? (
          <img
            src={serie.poster}
            alt={serie.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/80 to-transparent" />
      </div>

      <div className="relative -mt-48 max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-14 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 w-48 lg:w-64">
            {serie.poster ? (
              <img
                src={serie.poster}
                alt={serie.title}
                className="w-full rounded-2xl shadow-2xl shadow-black/50"
              />
            ) : (
              <div className="w-full aspect-[2/3] rounded-2xl bg-white/[0.04] flex items-center justify-center">
                <span className="text-4xl font-bold text-white/20">{serie.title.slice(0, 2)}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest">MyTV+</span>
                {serie.category && (
                  <span className="text-xs text-white/30 px-2 py-0.5 rounded-md bg-white/[0.04]">{serie.category}</span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display text-white mb-3">{serie.title}</h1>
              <div className="flex items-center gap-4 text-sm text-white/50">
                {serie.rating && (
                  <span className="flex items-center gap-1 text-yellow-400">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {serie.rating}
                  </span>
                )}
                {serie.numberOfSeasons && <span>{serie.numberOfSeasons} Season{Number(serie.numberOfSeasons) > 1 ? 's' : ''}</span>}
                {serie.age && <span>{serie.age}</span>}
              </div>
              <p className="text-white/30 text-sm mt-4">
                Episodes are not available for streaming at this time. This series has {serie.numberOfSeasons || '?'} season(s) listed on MyTV+.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
