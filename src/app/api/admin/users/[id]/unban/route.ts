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
  const record = await getUserRecord(id);
  if (!record) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  record.banned = false;
  record.banReason = null;
  await saveUserRecord(record);
  return NextResponse.json({ ok: true });
}
