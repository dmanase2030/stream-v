export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, fetchDiscordUser, createSessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = req.cookies.get('oauth_state')?.value;

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL('/?error=oauth_failed', req.url));
  }

  try {
    const accessToken = await exchangeCodeForToken(code);
    const user = await fetchDiscordUser(accessToken);
    const token = await createSessionToken(user);

    const res = NextResponse.redirect(new URL('/', req.url));
    res.cookies.set('session', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });
    res.cookies.delete('oauth_state');
    return res;
  } catch {
    return NextResponse.redirect(new URL('/?error=oauth_failed', req.url));
  }
}
