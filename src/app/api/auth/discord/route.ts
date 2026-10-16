export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getDiscordOAuthUrl } from '@/lib/auth';

function randomState(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

export async function GET(req: NextRequest) {
  try {
    const state = randomState();
    const url = getDiscordOAuthUrl(state);
    const res = NextResponse.redirect(url);
    // Store state in a short-lived cookie for CSRF protection
    res.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Discord login not configured' }, { status: 503 });
  }
}
