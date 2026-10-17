// Per-device site settings (admin-controlled, stored in localStorage)

export const HIDDEN_ROWS_KEY = 'luniflex_hidden_rows';
export const HERO_PICK_KEY = 'luniflex_hero_pick';

export interface HeroPick {
  id: number;
  type: 'movie' | 'tv';
}

function safeGet(key: string): string | null {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string | null) {
  try {
    if (typeof window === 'undefined') return;
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {}
}

export function getHiddenRows(): string[] {
  try {
    return JSON.parse(safeGet(HIDDEN_ROWS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function setHiddenRows(rows: string[]) {
  safeSet(HIDDEN_ROWS_KEY, JSON.stringify(rows));
}

export function getHeroPick(): HeroPick | null {
  try {
    const raw = safeGet(HERO_PICK_KEY);
    return raw ? (JSON.parse(raw) as HeroPick) : null;
  } catch {
    return null;
  }
}

export function setHeroPick(pick: HeroPick | null) {
  safeSet(HERO_PICK_KEY, pick ? JSON.stringify(pick) : null);
}

export const HOME_ROWS = [
  { id: 'continue', label: 'Continue Watching' },
  { id: 'mylist', label: 'My List' },
  { id: 'trending', label: 'Trending Now' },
  { id: 'top10movies', label: 'Top 10 Movies Today' },
  { id: 'top10tv', label: 'Top 10 TV Shows Today' },
  { id: 'crowd', label: 'Crowd Pleasers' },
  { id: 'popular-movies', label: 'Popular Movies' },
  { id: 'popular-tv', label: 'Popular TV Shows' },
  { id: 'top-rated-series', label: 'Top Rated Series' },
  { id: 'now-playing', label: 'Now Playing' },
  { id: 'mytv-movies', label: 'MyTV+ Movies' },
  { id: 'mytv-series', label: 'MyTV+ Series' },
];
