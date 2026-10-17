export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, isAdmin } from '@/lib/auth';
import { getUserRecord } from '@/lib/kv';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('session')?.value;
  if (!token) return NextResponse.json({ user: null });
  const session = await verifySessionToken(token);
  if (!session) return NextResponse.json({ user: null });
  // Banned users get signed out
  const record = await getUserRecord(session.id);
  if (record?.banned) {
    const res = NextResponse.json({ user: null, banned: true });
    res.cookies.delete('session');
    return res;
  }
  return NextResponse.json({
    user: {
      id: session.id,
      username: session.username,
      avatar: session.avatar,
      isAdmin: isAdmin(session.id),
    },
  });
}
