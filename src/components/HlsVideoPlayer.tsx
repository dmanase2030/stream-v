'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Hls from 'hls.js';
import { fetchStream, StreamResult } from '@/lib/streamApi';
import { streamingSources } from '@/lib/sources';
import { addToHistory, markAsWatched, updateProgress, getSavedTime } from '@/lib/history';
import NetflixChrome from '@/components/NetflixChrome';

interface HlsPlayerProps {
  type: 'movie' | 'tv';
  id: number;
  season?: number;
  episode?: number;
  title?: string;
  backdrop?: string | null;
  posterPath?: string | null;
  overview?: string;
  voteAverage?: number;
  runtime?: number;
  nextEpisodeUrl?: string | null;
  nextEpisodeLabel?: string;
  autoNext?: boolean;
  cinemaMode?: boolean;
  onBack?: () => void;
}

type PlayerMode = 'hls' | 'embed';

export default function HlsVideoPlayer({
  type, id, season, episode, title, backdrop, posterPath, overview, voteAverage,
  runtime, nextEpisodeUrl, nextEpisodeLabel, autoNext = true, cinemaMode = false, onBack,
}: HlsPlayerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastSaveRef = useRef(0);
  const watchTimerRef = useRef<NodeJS.Timeout>();

  const [mode, setMode] = useState<PlayerMode>('embed');
  const [streamData, setStreamData] = useState<StreamResult | null>(null);
  const [hlsLoading, setHlsLoading] = useState(true);
  const [hlsError, setHlsError] = useState(false);

  // Embed fallback state
  const [sourceIndex, setSourceIndex] = useState(0);
  const [embedLoading, setEmbedLoading] = useState(true);
  const [failedSources, setFailedSources] = useState<Set<number>>(new Set());
  const [autoTrying, setAutoTrying] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Shared state
  const [showNextButton, setShowNextButton] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const savedTime = getSavedTime(id, type, season, episode);
  const effectiveDuration = duration > 0 ? duration : (runtime || (type === 'tv' ? 45 : 120)) * 60;
  const triggerAt = Math.max(effectiveDuration - 120, effectiveDuration * 0.85);

  const currentSource = streamingSources[sourceIndex];
  const embedUrl = currentSource.supportsStartAt && savedTime > 0
    ? currentSource.getUrl(type, id, season, episode, savedTime)
    : currentSource.getUrl(type, id, season, episode);

  // Record to history
  useEffect(() => {
    addToHistory({
      id, type, title: title || '',
      poster_path: posterPath || null,
      backdrop_path: backdrop ? backdrop.replace('https://image.tmdb.org/t/p/original', '') : null,
      vote_average: voteAverage || 0,
      overview: overview || '',
      season, episode,
    });
    watchTimerRef.current = setTimeout(() => {
      markAsWatched(id, type, season, episode);
    }, 300000);
    return () => { if (watchTimerRef.current) clearTimeout(watchTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, type, season, episode]);

  // Fetch m3u8 stream
  useEffect(() => {
    if (mode !== 'hls') return;
    let cancelled = false;

    setHlsLoading(true);
    setHlsError(false);

    fetchStream(type, id, season, episode)
      .then((result) => {
        if (cancelled) return;
        setStreamData(result);
      })
      .catch(() => {
        if (cancelled) return;
        // Auto-fallback to embed — stream extraction failed
        setMode('embed');
        setEmbedLoading(true);
      });

    return () => { cancelled = true; };
  }, [mode, type, id, season, episode]);

  // Attach HLS when stream data is ready
  useEffect(() => {
    if (mode !== 'hls' || !streamData || !videoRef.current) return;

    const video = videoRef.current;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });
      hlsRef.current = hls;
      hls.loadSource(streamData.m3u8);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setHlsLoading(false);
        if (savedTime > 10) video.currentTime = savedTime;
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setHlsError(true);
          setHlsLoading(false);
          hls.destroy();
          hlsRef.current = null;
          // Auto-fallback to embed after 1s
          setTimeout(() => {
            setMode('embed');
            setEmbedLoading(true);
          }, 1000);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamData.m3u8;
      video.addEventListener('loadedmetadata', () => {
        setHlsLoading(false);
        if (savedTime > 10) video.currentTime = savedTime;
        video.play().catch(() => {});
      }, { once: true });
      video.addEventListener('error', () => {
        // Auto-fallback to embed
        setMode('embed');
        setEmbedLoading(true);
      }, { once: true });
    } else {
      setHlsError(true);
      setHlsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamData, mode]);

  // HLS video time tracking
  useEffect(() => {
    if (mode !== 'hls' || !videoRef.current) return;
    const video = videoRef.current;

    const handleTimeUpdate = () => {
      const ct = video.currentTime;
      const dur = video.duration || effectiveDuration;
      setCurrentTime(ct);
      if (dur > 0 && isFinite(dur)) setDuration(dur);

      const progress = dur > 0 ? Math.min(Math.round((ct / dur) * 100), 100) : 0;

      if (Math.abs(ct - lastSaveRef.current) >= 10) {
        lastSaveRef.current = ct;
        updateProgress(id, type, progress, season, episode, ct, dur);
      }

      if (nextEpisodeUrl && ct >= triggerAt && !hasNavigated) {
        setShowNextButton(true);
        setCountdown(Math.max(0, Math.ceil(dur - ct)));
      }
    };

    const handleEnded = () => {
      markAsWatched(id, type, season, episode);
      if (autoNext && nextEpisodeUrl && !hasNavigated) {
        setHasNavigated(true);
        router.push(nextEpisodeUrl);
      }
    };

    const handlePause = () => {
      const ct = video.currentTime;
      const dur = video.duration || effectiveDuration;
      const progress = dur > 0 ? Math.min(Math.round((ct / dur) * 100), 100) : 0;
      updateProgress(id, type, progress, season, episode, ct, dur);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('pause', handlePause);
    };
  }, [mode, id, type, season, episode, effectiveDuration, triggerAt, nextEpisodeUrl, autoNext, hasNavigated, router]);

  // Embed mode: listen to VixSrc postMessage events
  useEffect(() => {
    if (mode !== 'embed') return;

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      const msg = event.data;
      if (msg.type !== 'PLAYER_EVENT' || !msg.data) return;

      const { event: playerEvent, currentTime: ct, duration: dur } = msg.data;
      if (dur > 0) setDuration(dur);
      if (ct >= 0) setCurrentTime(ct);

      const realDuration = dur > 0 ? dur : effectiveDuration;
      const progress = realDuration > 0 ? Math.min(Math.round((ct / realDuration) * 100), 100) : 0;

      if (playerEvent === 'timeupdate' && ct > 0) {
        if (Math.abs(ct - lastSaveRef.current) >= 10) {
          lastSaveRef.current = ct;
          updateProgress(id, type, progress, season, episode, ct, realDuration);
        }
        if (nextEpisodeUrl && ct >= triggerAt && !hasNavigated) {
          setShowNextButton(true);
          setCountdown(Math.max(0, Math.ceil(realDuration - ct)));
        }
      }
      if (playerEvent === 'ended') {
        markAsWatched(id, type, season, episode);
        if (autoNext && nextEpisodeUrl && !hasNavigated) {
          setHasNavigated(true);
          router.push(nextEpisodeUrl);
        }
      }
      if (playerEvent === 'pause' && ct > 0) {
        updateProgress(id, type, progress, season, episode, ct, realDuration);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [mode, id, type, season, episode, effectiveDuration, triggerAt, nextEpisodeUrl, autoNext, hasNavigated, router]);

  // Embed auto-fallback
  const tryNextSource = useCallback(() => {
    const nextIndex = sourceIndex + 1;
    if (nextIndex < streamingSources.length && !failedSources.has(nextIndex)) {
      setAutoTrying(true);
      setFailedSources((prev) => new Set(prev).add(sourceIndex));
      setSourceIndex(nextIndex);
      setEmbedLoading(true);
    } else {
      setAutoTrying(false);
      setEmbedLoading(false);
    }
  }, [sourceIndex, failedSources]);

  useEffect(() => {
    if (mode === 'embed' && embedLoading && autoTrying) {
      timeoutRef.current = setTimeout(() => tryNextSource(), 8000);
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [mode, embedLoading, autoTrying, tryNextSource]);

  const switchToEmbed = () => {
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    setMode('embed');
    setSourceIndex(0);
    setEmbedLoading(true);
    setFailedSources(new Set());
    setAutoTrying(false);
  };

  const switchToHls = () => {
    setMode('hls');
    setHlsLoading(true);
    setHlsError(false);
    setStreamData(null);
  };

  const handleEmbedLoad = () => {
    setEmbedLoading(false);
    setAutoTrying(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleSourceChange = (i: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setFailedSources(new Set());
    setSourceIndex(i);
    setEmbedLoading(true);
    setAutoTrying(false);
    lastSaveRef.current = 0;
  };

  const handleNextEpisode = () => {
    if (nextEpisodeUrl && !hasNavigated) {
      markAsWatched(id, type, season, episode);
      setHasNavigated(true);
      router.push(nextEpisodeUrl);
    }
  };

  const progressPercent = effectiveDuration > 0 ? Math.min((currentTime / effectiveDuration) * 100, 100) : 0;

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isLoading = mode === 'hls' ? hlsLoading : embedLoading;

  const episodeLabel = season && episode ? `S${season} E${episode}` : undefined;

  const handleChromeSeek = (time: number) => {
    const video = videoRef.current;
    if (video && mode === 'hls') {
      video.currentTime = time;
    }
  };

  const handleChromeBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  // Cinema mode: fullscreen Netflix experience
  if (cinemaMode) {
    return (
      <div className="fixed inset-0 z-[100] bg-black">
        {/* Video layer */}
        <div className="absolute inset-0">
          {mode === 'hls' && (
            <video
              ref={videoRef}
              className="w-full h-full"
              playsInline
              autoPlay
              style={{ display: hlsError ? 'none' : 'block' }}
            />
          )}
          {mode === 'embed' && (
            <iframe
              ref={iframeRef}
              src={embedUrl}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              referrerPolicy="origin"
              onLoad={handleEmbedLoad}
              onError={() => autoTrying && tryNextSource()}
              title={title || 'Video Player'}
              style={{ border: 'none' }}
            />
          )}
          {isLoading && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center bg-black"
              style={{
                backgroundImage: backdrop ? `url(${backdrop})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-black/85" />
              <div className="relative flex flex-col items-center gap-4">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 rounded-full border-[3px] border-white/10" />
                  <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#E50914] animate-spin" />
                </div>
                <p className="text-white/60 text-sm">
                  {mode === 'hls' ? 'Loading stream...' : 'Connecting...'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Netflix chrome overlay */}
        <NetflixChrome
          title={title || 'Now Playing'}
          episodeLabel={episodeLabel}
          videoRef={videoRef}
          isEmbed={mode === 'embed'}
          onBack={handleChromeBack}
          nextEpisodeUrl={nextEpisodeUrl}
          nextEpisodeLabel={nextEpisodeLabel}
          currentTime={currentTime}
          duration={duration > 0 ? duration : effectiveDuration}
          onSeek={handleChromeSeek}
        />

        {/* Source switcher - minimal top right in cinema */}
        {mode === 'embed' && !isLoading && (
          <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-40">
            <select
              value={sourceIndex}
              onChange={(e) => handleSourceChange(Number(e.target.value))}
              className="bg-black/60 text-white/80 text-xs rounded px-2 py-1.5 border border-white/10 backdrop-blur-sm"
            >
              {streamingSources.map((s, i) => (
                <option key={s.name} value={i} className="bg-black">
                  {s.name}{failedSources.has(i) ? ' (failed)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Player */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black ring-1 ring-white/[0.04]">
        {/* Loading overlay */}
        {isLoading && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center"
            style={{
              backgroundImage: backdrop ? `url(${backdrop})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" />
            <div className="relative flex flex-col items-center gap-4">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-[3px] border-white/5" />
                <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-white animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-white text-sm font-medium mb-0.5">
                  {mode === 'hls'
                    ? hlsError ? 'Stream failed, switching...' : 'Loading stream...'
                    : autoTrying ? 'Trying servers...' : 'Connecting...'}
                </p>
                <p className="text-white/30 text-xs">
                  {mode === 'hls' ? (streamData?.provider || 'SAHND+ Stream') : currentSource.name}
                </p>
                {savedTime > 0 && (
                  <p className="text-accent-red text-[10px] mt-1">Resuming at {formatTime(savedTime)}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* HLS Video */}
        {mode === 'hls' && (
          <video
            ref={videoRef}
            className="w-full h-full"
            playsInline
            autoPlay
            controls
            style={{ display: hlsError ? 'none' : 'block' }}
          />
        )}

        {/* Auto-switch to embed if HLS fails */}
        {mode === 'hls' && hlsError && !hlsLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/90">
            <div className="text-center">
              <p className="text-white/60 text-sm mb-3">Native stream unavailable</p>
              <button
                onClick={switchToEmbed}
                className="px-5 py-2.5 rounded-lg bg-accent-red text-white text-sm font-semibold hover:bg-accent-red-hover transition-colors"
              >
                Switch to Embed Servers
              </button>
            </div>
          </div>
        )}

        {/* Embed iframe */}
        {mode === 'embed' && (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            referrerPolicy="origin"
            onLoad={handleEmbedLoad}
            onError={() => autoTrying && tryNextSource()}
            title={title || 'Video Player'}
            style={{ border: 'none' }}
          />
        )}

        {/* Next Episode Overlay */}
        {showNextButton && nextEpisodeUrl && !hasNavigated && (
          <div className="absolute bottom-0 left-0 right-0 z-20 animate-slide-up">
            <div className="bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-16 pb-4 px-4 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {autoNext && countdown > 0 && (
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="2" />
                        <circle
                          cx="18" cy="18" r="16" fill="none" stroke="#e50914" strokeWidth="2"
                          strokeDasharray={`${(countdown / 120) * 100.53} 100.53`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white">
                        {countdown}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-white/50 text-[11px] font-medium uppercase tracking-wider">
                      {autoNext ? 'Up next' : 'Next episode'}
                    </p>
                    <p className="text-white text-sm font-semibold truncate">
                      {nextEpisodeLabel || 'Next Episode'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {autoNext && (
                    <button
                      onClick={() => setShowNextButton(false)}
                      className="px-3 py-2 rounded-lg text-xs font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handleNextEpisode}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black text-sm font-bold hover:bg-white/90 transition-all active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                    </svg>
                    Play Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {!isLoading && currentTime > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-10">
            <div
              className="h-full bg-accent-red transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Server Bar */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.04] p-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-[11px] font-medium text-white/40">
              {mode === 'hls' ? `SAHND+ · ${streamData?.provider || 'Loading'}` : currentSource.name}
            </span>
            {!isLoading && currentTime > 10 && (
              <span className="text-[10px] text-white/20">
                {formatTime(currentTime)} / {formatTime(effectiveDuration)}
              </span>
            )}
            {mode === 'hls' && !hlsLoading && !hlsError && (
              <span className="text-[9px] text-emerald-500/60 font-medium">HLS</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {mode === 'embed' && !autoTrying && !embedLoading && (
              <button
                onClick={() => { setAutoTrying(true); tryNextSource(); }}
                className="text-[11px] text-white/20 hover:text-white/40 transition-colors"
              >
                Try auto-switch
              </button>
            )}
            {mode === 'embed' && autoTrying && (
              <button
                onClick={() => { setAutoTrying(false); if (timeoutRef.current) clearTimeout(timeoutRef.current); }}
                className="text-[11px] text-accent-red hover:text-accent-red-hover transition-colors font-medium"
              >
                Stop auto-switching
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
          {/* Embed server buttons */}
          {streamingSources.map((source, i) => {
            const isFailed = failedSources.has(i);
            const isActive = mode === 'embed' && i === sourceIndex;
            return (
              <button
                key={source.name}
                onClick={() => {
                  if (mode !== 'embed') setMode('embed');
                  handleSourceChange(i);
                }}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-black'
                    : isFailed
                    ? 'bg-white/[0.02] text-white/10 hover:bg-white/[0.04] hover:text-white/20'
                    : 'bg-white/[0.04] text-white/30 hover:bg-white/[0.07] hover:text-white/50'
                }`}
              >
                {isActive && !embedLoading && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                {isActive && embedLoading && <div className="w-3 h-3 border-[1.5px] border-black/20 border-t-black rounded-full animate-spin" />}
                {source.name}
              </button>
            );
          })}

          {/* SAHND+ native button */}
          <button
            onClick={switchToHls}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 ${
              mode === 'hls'
                ? 'bg-accent-red text-white'
                : 'bg-white/[0.04] text-white/30 hover:bg-white/[0.07] hover:text-white/50'
            }`}
          >
            {mode === 'hls' && !hlsLoading && !hlsError && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            {mode === 'hls' && hlsLoading && <div className="w-3 h-3 border-[1.5px] border-white/20 border-t-white rounded-full animate-spin" />}
            SAHND+
          </button>
        </div>
      </div>
    </div>
  );
}
