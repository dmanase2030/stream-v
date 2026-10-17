'use client';

import { useEffect, useState } from 'react';

const ANNOUNCEMENT_KEY = 'luniflex_announcement';

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setAnnouncement(localStorage.getItem(ANNOUNCEMENT_KEY));
  }, []);

  if (!announcement || dismissed) return null;

  return (
    <div className="bg-[#E50914] text-white text-center text-xs sm:text-sm font-medium px-10 py-2 relative z-[60]">
      <span className="line-clamp-1">{announcement}</span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition p-1"
        aria-label="Dismiss announcement"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
