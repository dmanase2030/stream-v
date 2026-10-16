import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  const referer = req.nextUrl.searchParams.get('referer') || '';
  if (!url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': referer,
        'Origin': referer ? new URL(referer).origin : '',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Upstream ${response.status}` }, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || '';
    const isM3U8 = contentType.includes('mpegurl') || url.endsWith('.m3u8') || url.includes('playlist');

    if (isM3U8) {
      // Rewrite URLs inside m3u8 so sub-requests also go through this proxy
      const text = await response.text();
      const protocol = req.headers.get('x-forwarded-proto') || 'https';
      const host = req.headers.get('host') || '';
      const serverUrl = `${protocol}://${host}`;
      const ref = encodeURIComponent(referer);

      const rewritten = text.split('\n').map(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
          // Rewrite URI="..." inside tags (e.g. encryption keys)
          return trimmed.replace(/URI="([^"]+)"/g, (_, uri) => {
            const absolute = new URL(uri, url).href;
            return `URI="${serverUrl}/api/proxy?url=${encodeURIComponent(absolute)}&referer=${ref}"`;
          });
        }
        // URL line — resolve to absolute and proxy
        try {
          const absolute = new URL(trimmed, url).href;
          return `${serverUrl}/api/proxy?url=${encodeURIComponent(absolute)}&referer=${ref}`;
        } catch {
          return line;
        }
      }).join('\n');

      return new Response(rewritten, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Cache-Control': 'no-cache, no-store',
        },
      });
    }

    // Binary content (ts segments, keys, etc.) — pass through
    const data = await response.arrayBuffer();
    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
