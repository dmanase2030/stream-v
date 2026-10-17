'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface NetflixChromeProps {
  title: string;
  episodeLabel?: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isEmbed: boolean;
  onBack: () => void;
  nextEpisodeUrl?: string | null;
  nextEpisodeLabel?: string;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  showEpisodesButton?: boolean;
  onOpenEpisodes?: () => void;
  showSourceButton?: boolean;
  onOpenSources?: () => void;
}

export default function NetflixChrome({
  title,
  episodeLabel,
  videoRef,
  isEmbed,
  onBack,
  nextEpisodeUrl,
  nextEpisodeLabel,
  currentTime,
  duration,
  onSeek,
  showEpisodesButton = false,
  onOpenEpisodes,
  showSourceButton = false,
  onOpenSources,
}: NetflixChromeProps) {
  const router = useRouter();
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showNextCard, setShowNextCard] = useState(false);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  const formatTime = (secs: number) => {
    if (!isFinite(secs) || secs < 0) return '0:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3500);
  }, []);

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [resetHideTimer]);

  // Show next episode card near the end
  useEffect(() => {
    if (nextEpisodeUrl && duration > 0 && duration - currentTime < 90 && currentTime > 0) {
      setShowNextCard(true);
    } else {
      setShowNextCard(false);
    }
  }, [currentTime, duration, nextEpisodeUrl]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || isEmbed) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
    resetHideTimer();
  };

  const skip = (secs: number) => {
    const video = videoRef.current;
    if (!video || isEmbed) return;
    video.currentTime = Math.max(0, Math.min((video.duration || duration), video.currentTime + secs));
    resetHideTimer();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video || isEmbed) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    resetHideTimer();
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    if (!progressRef.current || isEmbed) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(ratio * duration);
    resetHideTimer();
  };

  const toggleFullscreen = () => {
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        const video = videoRef.current as HTMLVideoElement & { webkitEnterFullscreen?: () => void } | null;
        // iPhone Safari: only video elements can go truly fullscreen
        if (!isEmbed && video && typeof video.webkitEnterFullscreen === 'function' && !video.paused) {
          video.webkitEnterFullscreen();
        } else if (!isEmbed && video && typeof video.webkitEnterFullscreen === 'function') {
          video.webkitEnterFullscreen();
        } else {
          const container = document.getElementById('cinema-player');
          const el = container || document.documentElement;
          if (el.requestFullscreen) {
            el.requestFullscreen().catch(() => {});
          } else if ((el as any).webkitRequestFullscreen) {
            (el as any).webkitRequestFullscreen();
          }
        }
      }
    } catch {}
    resetHideTimer();
  };

  return (
    <div
      className={`absolute inset-0 z-30 ${isEmbed ? 'pointer-events-none' : ''}`}
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
    >
      {/* Click to toggle controls (not on buttons) - HLS mode only so embed taps pass through */}
      {!isEmbed && (
        <div
          className="absolute inset-0"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[data-progress]')) return;
            if (showControls) {
              setShowControls(false);
              if (hideTimer.current) clearTimeout(hideTimer.current);
            } else {
              resetHideTimer();
            }
          }}
        />
      )}

      {/* Top bar - back + title */}
      <div
        className={`absolute top-0 left-0 right-0 transition-all duration-300 ${isEmbed ? 'pointer-events-auto' : ''} ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-gradient-to-b from-black/80 to-transparent px-4 sm:px-8 pt-4 sm:pt-6 pb-12">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 -ml-2 text-white hover:text-white/70 transition"
              aria-label="Back"
            >
              <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-white text-lg sm:text-xl font-semibold truncate">{title}</h1>
              {episodeLabel && (
                <p className="text-white/60 text-sm truncate">{episodeLabel}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Center play/pause - shows briefly on toggle */}
      {!isEmbed && (
        <button
          onClick={togglePlay}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
            showControls ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
          }`}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          <div className="w-20 h-20 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
            {isPlaying ? (
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </button>
      )}

      {/* Next episode card - Netflix style bottom right */}
      {showNextCard && nextEpisodeUrl && (
        <div className="absolute bottom-24 right-4 sm:right-8 z-40 animate-fade-up pointer-events-auto">
          <div className="bg-[#181818] rounded-lg overflow-hidden shadow-2xl w-64 sm:w-72">
            <div className="p-4">
              <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Up Next</p>
              <p className="text-white font-semibold text-sm mb-3 line-clamp-2">{nextEpisodeLabel || 'Next Episode'}</p>
              <button
                onClick={() => router.push(nextEpisodeUrl)}
                className="w-full py-2.5 bg-white hover:bg-white/90 text-black font-bold text-sm rounded transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Next Episode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom control bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${isEmbed ? 'pointer-events-auto' : ''} ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 sm:px-8 pb-4 sm:pb-6 pt-16">
          {/* Progress bar - Netflix red */}
          {!isEmbed && (
            <div
              ref={progressRef}
              data-progress
              onClick={handleProgressClick}
              className="group/bar relative h-1.5 hover:h-2.5 bg-white/20 rounded-full cursor-pointer mb-4 transition-all"
            >
              <div
                className="absolute left-0 top-0 bottom-0 bg-[#E50914] rounded-full"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-[#E50914] rounded-full opacity-0 group-hover/bar:opacity-100 transition-opacity shadow-lg"
                style={{ left: `${progress}%` }}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              {!isEmbed && (
                <>
                  <button onClick={togglePlay} className="text-white hover:text-white/70 transition" aria-label={isPlaying ? 'Pause' : 'Play'}>
                    {isPlaying ? (
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                  <button onClick={() => skip(-10)} className="text-white hover:text-white/70 transition" aria-label="Back 10 seconds">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v5h5" />
                      <text x="12" y="16" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none">10</text>
                    </svg>
                  </button>
                  <button onClick={() => skip(10)} className="text-white hover:text-white/70 transition" aria-label="Forward 10 seconds">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 3v5h-5" />
                      <text x="12" y="16" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none">10</text>
                    </svg>
                  </button>
                  <button onClick={toggleMute} className="text-white hover:text-white/70 transition" aria-label={isMuted ? 'Unmute' : 'Mute'}>
                    {isMuted ? (
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    ) : (
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    )}
                  </button>
                  <span className="text-white/80 text-sm hidden sm:block">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </>
              )}
              {isEmbed && (
                <span className="text-white/60 text-sm">Embed Player</span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-white text-sm font-medium hidden md:block truncate max-w-[200px]">{title}</span>
              {showSourceButton && onOpenSources && (
                <button onClick={() => { onOpenSources(); resetHideTimer(); }} className="text-white hover:text-white/70 transition" aria-label="Sources">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </button>
              )}
              {showEpisodesButton && onOpenEpisodes && (
                <button onClick={() => { onOpenEpisodes(); resetHideTimer(); }} className="text-white hover:text-white/70 transition" aria-label="Episodes">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              )}
              <button onClick={toggleFullscreen} className="text-white hover:text-white/70 transition" aria-label="Fullscreen">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
