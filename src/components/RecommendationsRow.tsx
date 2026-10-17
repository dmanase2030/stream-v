'use client';

import { useEffect, useState } from 'react';
import ContentRow from './ContentRow';
import { getLastWatched } from '@/lib/history';
import { Movie } from '@/types';

const TMDB_KEY = '3ea9ba88a81be0f283362871b7f6b19e';

export default function RecommendationsRow() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [baseTitle, setBaseTitle] = useState('');

  useEffect(() => {
    const last = getLastWatched();
    if (!last) return;
    const type = last.type === 'tv' ? 'tv' : 'movie';
    setBaseTitle(last.title);
    fetch(`https://api.themoviedb.org/3/${type}/${last.id}?api_key=${TMDB_KEY}&append_to_response=recommendations`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const recs = d?.recommendations?.results || [];
        if (recs.length) setMovies(recs.slice(0, 20));
      })
      .catch(() => {});
  }, []);

  if (!movies.length) return null;
  return <ContentRow title={`Because You Watched "${baseTitle}"`} movies={movies} />;
}
