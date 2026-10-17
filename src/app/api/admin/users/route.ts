export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, isAdmin } from '@/lib/auth';
import { listUserRecords } from '@/lib/kv';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('session')?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || !isAdmin(session.id)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const users = await listUserRecords();
  const withAdmin = users.map((u) => ({ ...u, isAdmin: isAdmin(u.id) }));
  return NextResponse.json({ users: withAdmin, total: withAdmin.length });
}
