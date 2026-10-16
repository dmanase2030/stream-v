import { fetchChannels } from '@/lib/channels';
import ChannelPlayer from '@/components/ChannelPlayer';

export const runtime = 'edge';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  try {
    const categories = await fetchChannels();
    const all = categories.flatMap((c) => c.channels);
    const ch = all.find((c) => c.id === id);
    if (ch) return { title: `${ch.name} - Live TV - LUNIFLEX` };
  } catch {}
  return { title: 'Live TV - LUNIFLEX' };
}

export default async function ChannelPage({ params }: Props) {
  const { id } = await params;
  let categories: Awaited<ReturnType<typeof fetchChannels>> = [];
  try {
    categories = await fetchChannels();
  } catch {}

  const allChannels = categories.flatMap((c) => c.channels);

  return <ChannelPlayer channelId={id} allChannels={allChannels} />;
}
