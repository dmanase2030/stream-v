'use client';

import { useState } from 'react';
import { PageTitle } from '../layout';

export default function AdminSettings() {
  const [dataMsg, setDataMsg] = useState('');

  const wipeWatchData = () => {
    localStorage.removeItem('streamv-watch-history');
    setDataMsg('Watch history cleared.');
    setTimeout(() => setDataMsg(''), 2500);
  };

  const replayIntro = () => {
    sessionStorage.removeItem('luniflex_intro_shown');
    setDataMsg('Intro will play on next visit.');
    setTimeout(() => setDataMsg(''), 2500);
  };

  return (
    <div>
      <PageTitle title="Settings" sub="Data and site settings." />
      {dataMsg && <p className="text-sm text-white/70 mb-4">{dataMsg}</p>}
      <div className="bg-[#141414] border border-white/10 rounded-md p-6 max-w-2xl">
        <h2 className="text-lg font-semibold mb-1">Data</h2>
        <p className="text-white/40 text-xs mb-4">These affect this device only.</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={wipeWatchData}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded transition"
          >
            Clear Watch History
          </button>
          <button
            onClick={replayIntro}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded transition"
          >
            Replay Intro
          </button>
        </div>
      </div>
    </div>
  );
}
