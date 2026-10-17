'use client';

import { useEffect, useState } from 'react';
import { PageTitle } from '../layout';

const ANNOUNCEMENT_KEY = 'luniflex_announcement';

export default function AdminAnnouncements() {
  const [announcement, setAnnouncement] = useState('');
  const [savedAnnouncement, setSavedAnnouncement] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSavedAnnouncement(localStorage.getItem(ANNOUNCEMENT_KEY));
    setAnnouncement(localStorage.getItem(ANNOUNCEMENT_KEY) || '');
  }, []);

  const saveAnnouncement = () => {
    if (announcement.trim()) {
      localStorage.setItem(ANNOUNCEMENT_KEY, announcement.trim());
      setSavedAnnouncement(announcement.trim());
    } else {
      localStorage.removeItem(ANNOUNCEMENT_KEY);
      setSavedAnnouncement(null);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const clearAnnouncement = () => {
    localStorage.removeItem(ANNOUNCEMENT_KEY);
    setAnnouncement('');
    setSavedAnnouncement(null);
  };

  return (
    <div>
      <PageTitle title="Announcements" sub="Shows as a banner at the top of every page." />
      <div className="bg-[#141414] border border-white/10 rounded-md p-6 max-w-2xl">
        <textarea
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          placeholder="e.g. New episodes added every Friday!"
          rows={3}
          className="w-full bg-black/60 border border-white/10 rounded px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 resize-none"
        />
        <div className="flex gap-2 mt-3">
          <button
            onClick={saveAnnouncement}
            className="flex-1 px-4 py-2.5 bg-[#E50914] hover:bg-[#f6121d] text-white text-sm font-bold rounded transition"
          >
            {saved ? 'Saved!' : savedAnnouncement ? 'Update' : 'Publish'}
          </button>
          {savedAnnouncement && (
            <button
              onClick={clearAnnouncement}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded transition"
            >
              Remove
            </button>
          )}
        </div>
        {savedAnnouncement && (
          <p className="text-white/40 text-xs mt-3">Live: {savedAnnouncement}</p>
        )}
      </div>
    </div>
  );
}
