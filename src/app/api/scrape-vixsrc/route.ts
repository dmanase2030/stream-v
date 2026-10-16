import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const maxDuration = 15;

const VIXSRC_BASE = 'https://vixsrc.to';

export async function GET(req: NextRequest) {
  const tmdbId = req.nextUrl.searchParams.get('id');
  const type = req.nextUrl.searchParams.get('type') || 'movie';
  const season = req.nextUrl.searchParams.get('s');
  const episode = req.nextUrl.searchParams.get('e');

  if (!tmdbId) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const vixsrcUrl =
    type === 'tv' && season && episode
      ? `${VIXSRC_BASE}/tv/${tmdbId}/${season}/${episode}`
      : `${VIXSRC_BASE}/movie/${tmdbId}`;

  try {
    const res = await fetch(vixsrcUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, error: `HTTP ${res.status}` }, { status: 502 });
    }

    const html = await res.text();

    // Extract master playlist from window.masterPlaylist
    if (html.includes('window.masterPlaylist')) {
      const urlMatch = html.match(/url:\s*['"]([^'"]+)['"]/);
      const tokenMatch = html.match(/['"]?token['"]?\s*:\s*['"]([^'"]+)['"]/);
      const expiresMatch = html.match(/['"]?expires['"]?\s*:\s*['"]([^'"]+)['"]/);

      if (urlMatch && tokenMatch && expiresMatch) {
        const baseUrl = urlMatch[1];
        const token = tokenMatch[1];
        const expires = expiresMatch[1];
        const sep = baseUrl.includes('?b=1') ? '&' : '?';
        const masterPlaylistUrl = `${baseUrl}${sep}token=${token}&expires=${expires}&h=1&lang=en`;

        return NextResponse.json({
          success: true,
          masterPlaylistUrl,
          referer: vixsrcUrl,
        });
      }
    }

    // Fallback: direct .m3u8 URL
    const m3u8Match = html.match(/(https?:\/\/[^'"\s]+\.m3u8[^'"\s]*)/);
    if (m3u8Match) {
      return NextResponse.json({
        success: true,
        masterPlaylistUrl: m3u8Match[1],
        referer: vixsrcUrl,
      });
    }

    return NextResponse.json({ success: false, error: 'No stream found in page' }, { status: 404 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 502 });
  }
}
