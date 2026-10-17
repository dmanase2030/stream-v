import { StreamingSource } from '@/types';

// SAHND+ brand colors (hex without #)
const PRIMARY_COLOR = 'E50914';
const SECONDARY_COLOR = 'B20710';

export const streamingSources: StreamingSource[] = [
  {
    name: 'VixSrc',
    supportsEvents: true,
    supportsStartAt: true,
    getUrl: (type, id, season, episode, startAt) => {
      let url = `https://vixsrc.to/${type}/${id}`;
      if (type === 'tv' && season && episode) {
        url = `https://vixsrc.to/tv/${id}/${season}/${episode}`;
      }
      const params = new URLSearchParams();
      params.set('primaryColor', PRIMARY_COLOR);
      params.set('secondaryColor', SECONDARY_COLOR);
      params.set('autoplay', 'true');
      if (startAt && startAt > 10) {
        params.set('startAt', String(Math.floor(startAt)));
      }
      return `${url}?${params.toString()}`;
    },
  },
];
