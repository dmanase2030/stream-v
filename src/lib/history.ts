export interface WatchHistoryItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  overview: string;
  season?: number;
  episode?: number;
  timestamp: number; // when they started watching
  progress: number; // 0-100 percentage
  completed: boolean;
  currentTime?: number; // exact playback position in seconds (for resume)
  duration?: number; // total duration in seconds
}

const HISTORY_KEY = 'streamv-watch-history';

export const getWatchHistory = (): WatchHistoryItem[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : [];
};

export const getLastWatched = (): WatchHistoryItem | null => {
  const history = getWatchHistory();
  if (!history.length) return null;
  return history.sort((a, b) => b.timestamp - a.timestamp)[0];
};

export const addToHistory = (item: Omit<WatchHistoryItem, 'timestamp' | 'progress' | 'completed'>): void => {
  const history = getWatchHistory();
  // Remove existing entry for same content
  const filtered = history.filter((h) => !(h.id === item.id && h.type === item.type && h.season === item.season && h.episode === item.episode));
  filtered.unshift({
    ...item,
    timestamp: Date.now(),
    progress: 0,
    completed: false,
  });
  // Keep last 50 items
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered.slice(0, 50)));
};

export const updateProgress = (id: number, type: 'movie' | 'tv', progress: number, season?: number, episode?: number, currentTime?: number, duration?: number): void => {
  const history = getWatchHistory();
  const item = history.find((h) => h.id === id && h.type === type && h.season === season && h.episode === episode);
  if (item) {
    item.progress = progress;
    item.completed = progress >= 90;
    item.timestamp = Date.now();
    if (currentTime !== undefined) item.currentTime = Math.floor(currentTime);
    if (duration !== undefined) item.duration = Math.floor(duration);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
};

export const markAsWatched = (id: number, type: 'movie' | 'tv', season?: number, episode?: number): void => {
  const history = getWatchHistory();
  const item = history.find((h) => h.id === id && h.type === type && h.season === season && h.episode === episode);
  if (item) {
    item.progress = 100;
    item.completed = true;
    item.timestamp = Date.now();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
};

export const isWatched = (id: number, type: 'movie' | 'tv', season?: number, episode?: number): boolean => {
  return getWatchHistory().some((h) => h.id === id && h.type === type && h.season === season && h.episode === episode && h.completed);
};

export const getProgress = (id: number, type: 'movie' | 'tv', season?: number, episode?: number): number => {
  const item = getWatchHistory().find((h) => h.id === id && h.type === type && h.season === season && h.episode === episode);
  return item?.progress || 0;
};

// Get saved playback position in seconds (for startAt resume)
export const getSavedTime = (id: number, type: 'movie' | 'tv', season?: number, episode?: number): number => {
  const item = getWatchHistory().find((h) => h.id === id && h.type === type && h.season === season && h.episode === episode);
  if (item && !item.completed && item.currentTime && item.currentTime > 10) {
    return item.currentTime;
  }
  return 0;
};

export const getResumeUrl = (item: WatchHistoryItem): string => {
  if (item.type === 'tv' && item.season && item.episode) {
    return `/watch/tv/${item.id}?s=${item.season}&e=${item.episode}`;
  }
  return `/watch/${item.type}/${item.id}`;
};

export const getContinueWatching = (): WatchHistoryItem[] => {
  return getWatchHistory()
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 20);
};

export const getRecentlyWatched = (): WatchHistoryItem[] => {
  return getWatchHistory()
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 20);
};

// Get overall progress for a TV show (how many episodes watched out of total)
export const getShowProgress = (tvId: number): { watched: number; total: number; lastSeason?: number; lastEpisode?: number } => {
  const history = getWatchHistory().filter((h) => h.id === tvId && h.type === 'tv');
  const watched = history.filter((h) => h.completed).length;
  const total = history.length;
  const lastItem = history.sort((a, b) => b.timestamp - a.timestamp)[0];
  return {
    watched,
    total,
    lastSeason: lastItem?.season,
    lastEpisode: lastItem?.episode,
  };
};

// Get the last watched episode for a TV show (for resume)
export const getLastWatchedEpisode = (tvId: number): { season: number; episode: number; completed: boolean } | null => {
  const history = getWatchHistory()
    .filter((h) => h.id === tvId && h.type === 'tv')
    .sort((a, b) => b.timestamp - a.timestamp);
  if (!history.length) return null;
  const last = history[0];
  if (last.season && last.episode) {
    return { season: last.season, episode: last.episode, completed: last.completed };
  }
  return null;
};
