'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Profile {
  id: string;
  name: string;
  color: string;
  avatar?: string;
}

const AVATAR_COLORS = [
  '#E50914', // Netflix red
  '#0071EB', // Blue
  '#46d369', // Green
  '#F5C518', // Yellow
  '#A020F0', // Purple
];

const STORAGE_KEY = 'luniflex_profiles';
const ACTIVE_KEY = 'luniflex_active_profile';

export function getProfiles(): Profile[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getActiveProfile(): Profile | null {
  if (typeof window === 'undefined') return null;
  try {
    const profiles = getProfiles();
    const activeId = localStorage.getItem(ACTIVE_KEY);
    return profiles.find(p => p.id === activeId) || null;
  } catch {
    return null;
  }
}

export function setActiveProfile(id: string) {
  localStorage.setItem(ACTIVE_KEY, id);
}

export function clearActiveProfile() {
  localStorage.removeItem(ACTIVE_KEY);
}

export default function ProfileGate() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [managing, setManaging] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    const stored = getProfiles();
    const active = getActiveProfile();
    if (active && stored.length > 0) {
      // Already have an active profile, don't show gate
      setLoading(false);
      return;
    }
    setProfiles(stored);
    setLoading(false);
  }, []);

  const selectProfile = (id: string) => {
    setActiveProfile(id);
    window.location.reload();
  };

  const addProfile = () => {
    if (!newName.trim() || profiles.length >= 5) return;
    const newProfile: Profile = {
      id: `p_${Date.now()}`,
      name: newName.trim(),
      color: AVATAR_COLORS[profiles.length % AVATAR_COLORS.length],
    };
    const updated = [...profiles, newProfile];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setProfiles(updated);
    setNewName('');
    setAdding(false);
  };

  const deleteProfile = (id: string) => {
    const updated = profiles.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setProfiles(updated);
    if (getActiveProfile()?.id === id) clearActiveProfile();
  };

  // Don't show gate if there's an active profile
  const active = getActiveProfile();
  if (!loading && active && profiles.length > 0) return null;
  if (loading) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-[#141414] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="absolute top-8 left-[4%]">
        <span className="text-[#E50914] font-black text-3xl tracking-tighter uppercase" style={{ fontFamily: 'Arial Black, sans-serif' }}>
          LUNIFLEX
        </span>
      </div>

      <h1 className="text-white text-3xl sm:text-5xl font-medium mb-8">Who&apos;s watching?</h1>

      <div className="flex flex-wrap items-start justify-center gap-4 sm:gap-6 mb-10">
        {profiles.map((profile) => (
          <div key={profile.id} className="relative group">
            <button
              onClick={() => !managing && selectProfile(profile.id)}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={`w-20 h-20 sm:w-28 sm:h-28 rounded-md flex items-center justify-center text-3xl sm:text-4xl font-bold text-white transition-all ${
                  managing ? '' : 'group-hover:ring-4 group-hover:ring-white'
                }`}
                style={{ backgroundColor: profile.color }}
              >
                {profile.name[0]?.toUpperCase()}
                {managing && (
                  <div className="absolute inset-0 rounded-md bg-black/60 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                )}
              </div>
              <span className={`text-sm ${managing ? 'text-[#808080]' : 'text-[#808080] group-hover:text-white'} transition-colors`}>
                {profile.name}
              </span>
            </button>
            {managing && (
              <button
                onClick={() => deleteProfile(profile.id)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center hover:bg-red-700"
                aria-label={`Delete ${profile.name}`}
              >
                ×
              </button>
            )}
          </div>
        ))}

        {/* Add profile */}
        {profiles.length < 5 && !managing && (
          <button onClick={() => setAdding(true)} className="flex flex-col items-center gap-2 group">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-md flex items-center justify-center text-5xl text-[#808080] group-hover:text-white group-hover:bg-white/10 transition-all">
              +
            </div>
            <span className="text-sm text-[#808080] group-hover:text-white transition-colors">Add Profile</span>
          </button>
        )}
      </div>

      {/* Add profile form */}
      {adding && (
        <div className="mb-8 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Profile name"
            maxLength={20}
            className="px-4 py-2 bg-[#333] text-white rounded text-sm outline-none focus:ring-2 focus:ring-white/50"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && addProfile()}
          />
          <button onClick={addProfile} className="px-4 py-2 bg-white text-black text-sm font-semibold rounded hover:bg-white/80">
            Save
          </button>
          <button onClick={() => { setAdding(false); setNewName(''); }} className="px-4 py-2 text-[#808080] text-sm hover:text-white">
            Cancel
          </button>
        </div>
      )}

      {/* Manage button */}
      {profiles.length > 0 && (
        <button
          onClick={() => setManaging(!managing)}
          className="px-6 py-2 border border-[#808080] text-[#808080] hover:text-white hover:border-white text-sm tracking-widest uppercase transition"
        >
          {managing ? 'Done' : 'Manage Profiles'}
        </button>
      )}

      {profiles.length === 0 && !adding && (
        <p className="text-[#808080] text-sm">Click &quot;Add Profile&quot; to get started</p>
      )}
    </div>
  );
}
