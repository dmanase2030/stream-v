import ContentRow from '@/components/ContentRow';
import Top10Row from '@/components/Top10Row';
import { getUpcomingMovies, getNowPlayingMovies, getTrending } from '@/lib/tmdb';

export const runtime = 'edge';

export default async function NewPage() {
  const [upcoming, nowPlaying, trending] = await Promise.all([
    getUpcomingMovies().catch(() => ({ results: [] })),
    getNowPlayingMovies().catch(() => ({ results: [] })),
    getTrending('week').catch(() => ({ results: [] })),
  ]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pt-24 pb-4 px-[4%]">
        <h1 className="text-2xl md:text-3xl font-bold">New & Popular</h1>
        <p className="text-white/50 text-sm mt-1">Fresh releases, coming soon, and what&apos;s trending.</p>
      </div>
      <div className="space-y-2 pb-16">
        <Top10Row title="Top 10 This Week" movies={(trending as any).results || []} />
        <ContentRow title="Coming Soon" movies={(upcoming as any).results || []} type="movie" />
        <ContentRow title="New Releases" movies={(nowPlaying as any).results || []} type="movie" />
      </div>
    </div>
  );
}
