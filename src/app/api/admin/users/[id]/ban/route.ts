export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, isAdmin } from '@/lib/auth';
import { getUserRecord, saveUserRecord } from '@/lib/kv';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get('session')?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || !isAdmin(session.id)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const { id } = await params;
  if (isAdmin(id)) {
    return NextResponse.json({ error: 'cannot_ban_admin' }, { status: 400 });
  }
  const body = await req.json().catch(() => ({}));
  const record = (await getUserRecord(id)) || {
    id,
    username: 'Unknown',
    avatar: null,
    firstSeen: Date.now(),
    lastSeen: Date.now(),
    banned: false,
  };
  record.banned = true;
  record.banReason = body.reason || 'Banned by admin';
  record.bannedAt = Date.now();
  await saveUserRecord(record);
  return NextResponse.json({ ok: true });
}
