import { NextRequest, NextResponse } from 'next/server';
import { getSeasonDetail } from '@/lib/tmdb';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tvId = Number(searchParams.get('tvId'));
  const season = Number(searchParams.get('season'));

  if (!tvId || isNaN(season)) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  try {
    const data = await getSeasonDetail(tvId, season);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
