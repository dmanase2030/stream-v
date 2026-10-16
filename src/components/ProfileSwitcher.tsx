'use client';

import { useEffect, useState, useRef } from 'react';
import { getActiveProfile, getProfiles, clearActiveProfile } from './ProfileGate';

interface Profile {
  id: string;
  name: string;
  color: string;
}

export default function ProfileSwitcher() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProfile(getActiveProfile());
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!profile) return null;

  const switchProfile = () => {
    clearActiveProfile();
    window.location.reload();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 hover:opacity-80 transition"
        aria-label="Switch profile"
      >
        <div
          className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold text-white"
          style={{ backgroundColor: profile.color }}
        >
          {profile.name[0]?.toUpperCase()}
        </div>
        <svg
          className={`w-3 h-3 text-white transition-transform ${open ? 'rotate-180' : ''}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-black/95 border border-white/20 shadow-2xl z-50">
          <div className="py-2">
            <div className="px-4 py-2 border-b border-white/10">
              <p className="text-xs text-white/50">Watching as</p>
              <p className="text-sm text-white font-medium">{profile.name}</p>
            </div>
            <button
              onClick={switchProfile}
              className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition"
            >
              Switch Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
