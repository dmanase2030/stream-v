import { getRequestContext } from '@cloudflare/next-on-pages';

// Minimal KV binding types (no @cloudflare/workers-types dependency)
interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  list(opts?: { prefix?: string; cursor?: string }): Promise<{
    keys: { name: string }[];
    list_complete: boolean;
    cursor: string;
  }>;
}

export interface KVUser {
  id: string;
  username: string;
  avatar: string | null;
  firstSeen: number;
  lastSeen: number;
  banned: boolean;
  banReason?: string | null;
  bannedAt?: number;
}

function getKV(): KVNamespace | null {
  try {
    const ctx = getRequestContext();
    const kv = (ctx.env as Record<string, unknown>).USERS_KV as KVNamespace | undefined;
    return kv || null;
  } catch {
    return null;
  }
}

export async function getUserRecord(id: string): Promise<KVUser | null> {
  const kv = getKV();
  if (!kv) return null;
  try {
    const raw = await kv.get(`user:${id}`);
    return raw ? (JSON.parse(raw) as KVUser) : null;
  } catch {
    return null;
  }
}

export async function saveUserRecord(user: KVUser): Promise<void> {
  const kv = getKV();
  if (!kv) return;
  try {
    await kv.put(`user:${user.id}`, JSON.stringify(user));
  } catch {}
}

export async function listUserRecords(): Promise<KVUser[]> {
  const kv = getKV();
  if (!kv) return [];
  try {
    const users: KVUser[] = [];
    let cursor: string | undefined;
    do {
      const page = await kv.list({ prefix: 'user:', cursor });
      for (const key of page.keys) {
        const raw = await kv.get(key.name);
        if (raw) {
          try {
            users.push(JSON.parse(raw) as KVUser);
          } catch {}
        }
      }
      cursor = page.list_complete ? undefined : page.cursor;
    } while (cursor);
    return users.sort((a, b) => b.lastSeen - a.lastSeen);
  } catch {
    return [];
  }
}
