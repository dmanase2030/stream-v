'use client';

import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Check if we've already shown it this session
    const shown = sessionStorage.getItem('luniflex_intro_shown');
    if (shown) {
      setVisible(false);
      return;
    }

    // Netflix-style intro: show logo animation, then fade out
    const fadeTimer = setTimeout(() => setFading(true), 2200);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('luniflex_intro_shown', '1');
    }, 2800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[300] bg-black flex items-center justify-center transition-opacity duration-700 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Netflix-style L logo animation */}
      <div className="relative">
        <div
          className="text-[#E50914] font-black tracking-tighter uppercase animate-logo-zoom"
          style={{
            fontFamily: 'Arial Black, sans-serif',
            fontSize: 'clamp(3rem, 12vw, 7rem)',
            textShadow: '0 0 80px rgba(229, 9, 20, 0.5)',
          }}
        >
          L
        </div>
        {/* Light streak effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
        </div>
      </div>

      <style jsx>{`
        @keyframes logo-zoom {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: scale(1.05);
            opacity: 1;
          }
        }
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }
        .animate-logo-zoom {
          animation: logo-zoom 2.2s ease-out forwards;
        }
        .animate-shine {
          animation: shine 1.5s ease-in-out 0.3s forwards;
        }
      `}</style>
    </div>
  );
}
