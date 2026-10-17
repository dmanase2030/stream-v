'use client';

import { useEffect, useState } from 'react';
import ContentRow from './ContentRow';
import { discoverMovies, discoverTV } from '@/lib/tmdb';
import { Movie } from '@/types';

const ROWS: { title: string; type: 'movie' | 'tv'; genreId: number }[] = [
  { title: 'Action Movies', type: 'movie', genreId: 28 },
  { title: 'Comedies', type: 'movie', genreId: 35 },
  { title: 'Horror Movies', type: 'movie', genreId: 27 },
  { title: 'Sci-Fi Series', type: 'tv', genreId: 10765 },
  { title: 'Crime TV Shows', type: 'tv', genreId: 80 },
  { title: 'Documentaries', type: 'movie', genreId: 99 },
];

export default function GenreRows() {
  const [rows, setRows] = useState<{ title: string; movies: Movie[] }[]>([]);

  useEffect(() => {
    Promise.all(
      ROWS.map(async (row) => {
        try {
          const data =
            row.type === 'movie'
              ? await discoverMovies({ with_genres: String(row.genreId), sort_by: 'popularity.desc' })
              : await discoverTV({ with_genres: String(row.genreId), sort_by: 'popularity.desc' });
          return { title: row.title, movies: (data.results || []).slice(0, 20) };
        } catch {
          return { title: row.title, movies: [] as Movie[] };
        }
      })
    ).then((res) => setRows(res.filter((r) => r.movies.length > 0)));
  }, []);

  return (
    <>
      {rows.map((row) => (
        <ContentRow key={row.title} title={row.title} movies={row.movies} />
      ))}
    </>
  );
}
