// User preferences (per-device localStorage)
const KEYS = {
  autoplay: 'luniflex_autoplay',
  trailerAutoplay: 'luniflex_trailer_autoplay',
};

export function getAutoplay(): boolean {
  if (typeof window === 'undefined') return true;
  const v = localStorage.getItem(KEYS.autoplay);
  return v === null ? true : v === '1';
}

export function setAutoplay(on: boolean): void {
  localStorage.setItem(KEYS.autoplay, on ? '1' : '0');
}

export function getTrailerAutoplay(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(KEYS.trailerAutoplay) === '1';
}

export function setTrailerAutoplay(on: boolean): void {
  localStorage.setItem(KEYS.trailerAutoplay, on ? '1' : '0');
}
