import { Movie } from '@/types';

const KEY = 'luniflex_my_list';

function read(): Movie[] {
  try {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function write(list: Movie[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('luniflex-mylist-changed'));
  } catch {}
}

export function getMyList(): Movie[] {
  return read();
}

export function isInMyList(id: number): boolean {
  return read().some((m) => m.id === id);
}

// Returns true if now in list, false if removed
export function toggleMyList(movie: Movie): boolean {
  const list = read();
  const idx = list.findIndex((m) => m.id === movie.id);
  if (idx >= 0) {
    list.splice(idx, 1);
    write(list);
    return false;
  }
  // Store a slim copy with media_type set
  const { id, title, name, backdrop_path, poster_path, overview, vote_average, release_date, first_air_date } = movie;
  write([{ id, title, name, backdrop_path, poster_path, overview, vote_average, release_date, first_air_date, media_type: (movie as any).media_type || undefined } as Movie, ...list]);
  return true;
}

export const clearMyList = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event('luniflex-mylist-changed'));
};
