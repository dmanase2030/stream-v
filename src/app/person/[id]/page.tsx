import Link from 'next/link';
import Image from 'next/image';
import ContentRow from '@/components/ContentRow';

export const runtime = 'edge';

const TMDB_KEY = '3ea9ba88a81be0f283362871b7f6b19e';

async function getPerson(id: string) {
  const res = await fetch(
    `https://api.themoviedb.org/3/person/${id}?api_key=${TMDB_KEY}&append_to_response=combined_credits`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = await getPerson(id);

  if (!person) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-white/50">Person not found.</p>
      </div>
    );
  }

  const credits = (person.combined_credits?.cast || [])
    .filter((c: any) => c.poster_path)
    .sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 30)
    .map((c: any) => ({ ...c, media_type: c.media_type || (c.first_air_date ? 'tv' : 'movie') }));

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-[4%] py-8 pt-24">
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          {person.profile_path ? (
            <div className="relative w-40 sm:w-52 aspect-[2/3] rounded-md overflow-hidden shrink-0 bg-[#1a1a1a]">
              <Image
                src={`https://image.tmdb.org/t/p/w342${person.profile_path}`}
                alt={person.name}
                fill
                className="object-cover"
                sizes="208px"
              />
            </div>
          ) : null}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{person.name}</h1>
            {person.known_for_department && (
              <p className="text-white/50 text-sm mb-4">{person.known_for_department}</p>
            )}
            {person.biography && (
              <p className="text-white/70 text-sm leading-relaxed line-clamp-6">{person.biography}</p>
            )}
          </div>
        </div>
        <Link href="/" className="text-sm text-white/50 hover:text-white transition">← Back to home</Link>
      </div>
      {credits.length > 0 && (
        <div className="pb-16">
          <ContentRow title={`Known For`} movies={credits} />
        </div>
      )}
    </div>
  );
}
