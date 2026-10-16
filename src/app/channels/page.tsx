import { fetchChannels } from '@/lib/channels';
import ChannelGrid from '@/components/ChannelGrid';

export const runtime = 'edge';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Live TV - SAHND+',
  description: 'Watch live TV channels from around the world',
};

export default async function ChannelsPage() {
  let categories: Awaited<ReturnType<typeof fetchChannels>> = [];
  try {
    categories = await fetchChannels();
  } catch (e) {
    console.error('Failed to fetch channels:', e);
  }

  const totalChannels = categories.reduce((t, c) => t + c.channels.length, 0);

  return (
    <div className="min-h-screen page-enter">
      {/* Hero */}
      <div className="relative h-[40vh] min-h-[320px] flex items-end">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-red/10 via-bg-primary/50 to-bg-primary" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(229,9,20,0.15),transparent_70%)]" />
        <div className="relative max-w-[1800px] mx-auto w-full px-6 sm:px-8 lg:px-14 pb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold text-red-400 uppercase tracking-widest">Live TV</span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl text-white mb-2">Channels</h1>
          <p className="text-white/40 text-sm">
            {totalChannels} channels across {categories.length} categories
          </p>
        </div>
      </div>

      {/* Channel Grid */}
      <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-14 pb-16">
        {categories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/30 text-lg">No channels available</p>
          </div>
        ) : (
          <ChannelGrid categories={categories} />
        )}
      </div>
    </div>
  );
}
