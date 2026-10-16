'use client';

import { useEffect, useRef, useState } from 'react';

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<'logo' | 'streaks' | 'fade'>('logo');
  const audioRef = useRef<AudioContext | null>(null);
  const soundPlayedRef = useRef(false);

  // Synthesized "ta-dum" style two-tone chime (original, not Netflix's copyrighted sound)
  const playTadum = () => {
    if (soundPlayedRef.current) return;
    soundPlayedRef.current = true;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioRef.current = ctx;

      // Two-tone: low "ta" then higher "dum"
      const playNote = (freq: number, startTime: number, duration: number, volume: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        // Slight pitch bend for cinematic feel
        osc.frequency.exponentialRampToValueAtTime(freq * 0.98, startTime + duration);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(volume, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration + 0.1);
      };

      const now = ctx.currentTime;
      playNote(146.83, now, 0.6, 0.4); // D3 - "ta"
      playNote(220.0, now + 0.35, 1.2, 0.5); // A3 - "dum"
      // Add a subtle low boom
      playNote(73.42, now + 0.35, 1.5, 0.3); // D2
    } catch {
      // Audio blocked or unsupported - skip silently
    }
  };

  useEffect(() => {
    const shown = sessionStorage.getItem('luniflex_intro_shown');
    if (shown) {
      setVisible(false);
      return;
    }

    // Try to play sound immediately (works if user interacted before in this tab)
    playTadum();

    // Fallback: play on first tap/click (mobile autoplay policy)
    const playOnInteract = () => {
      if (!soundPlayedRef.current) playTadum();
    };
    window.addEventListener('pointerdown', playOnInteract, { once: true });
    window.addEventListener('touchstart', playOnInteract, { once: true });

    // Phase 1: Logo (0 - 1.8s) - red L scales up like Netflix N
    // Phase 2: Streaks (1.8s - 3.2s) - L explodes into colorful light streaks
    // Phase 3: Fade (3.2s - 3.8s)
    const streakTimer = setTimeout(() => setPhase('streaks'), 1800);
    const fadeTimer = setTimeout(() => setPhase('fade'), 3200);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('luniflex_intro_shown', '1');
    }, 3900);

    return () => {
      clearTimeout(streakTimer);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
      window.removeEventListener('pointerdown', playOnInteract);
      window.removeEventListener('touchstart', playOnInteract);
      audioRef.current?.close().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  // Colorful streak colors like Netflix intro
  const streakColors = [
    '#ff0000', '#ff3300', '#ff6600', '#ff9900', '#ffcc00',
    '#ffff00', '#ccff00', '#66ff00', '#00ff66', '#00ffcc',
    '#00ccff', '#0099ff', '#0066ff', '#3300ff', '#6600ff',
  ];

  return (
    <div
      className={`fixed inset-0 z-[300] bg-black flex items-center justify-center overflow-hidden transition-opacity duration-700 ${
        phase === 'fade' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {phase === 'logo' && (
        <div
          className="text-[#E50914] font-black tracking-tighter uppercase"
          style={{
            fontFamily: 'Arial Black, sans-serif',
            fontSize: 'clamp(4rem, 18vw, 10rem)',
            textShadow: '0 0 100px rgba(229, 9, 20, 0.6)',
            animation: 'netflix-logo-in 1.8s ease-out forwards',
          }}
        >
          L
        </div>
      )}

      {phase !== 'logo' && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Light streaks expanding outward */}
          <div className="flex items-center h-full" style={{ animation: 'streaks-expand 1.4s ease-out forwards' }}>
            {streakColors.map((color, i) => (
              <div
                key={i}
                className="h-full mx-[2px]"
                style={{
                  width: 'clamp(4px, 1.5vw, 12px)',
                  background: `linear-gradient(to bottom, transparent 10%, ${color} 30%, ${color} 70%, transparent 90%)`,
                  boxShadow: `0 0 30px ${color}`,
                  opacity: 0.9,
                  animation: `streak-flicker 0.3s ease-in-out ${i * 0.02}s infinite alternate`,
                }}
              />
            ))}
          </div>
          {/* Center glow */}
          <div
            className="absolute w-40 h-40 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(229,9,20,0.8) 0%, transparent 70%)',
              animation: 'glow-pulse 1.4s ease-out forwards',
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes netflix-logo-in {
          0% {
            transform: scale(0.7);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          100% {
            transform: scale(1.15);
            opacity: 1;
          }
        }
        @keyframes streaks-expand {
          0% {
            transform: scaleX(0.1);
            opacity: 0.5;
          }
          30% {
            opacity: 1;
          }
          100% {
            transform: scaleX(2.5);
            opacity: 0;
          }
        }
        @keyframes streak-flicker {
          0% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
          }
        }
        @keyframes glow-pulse {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
