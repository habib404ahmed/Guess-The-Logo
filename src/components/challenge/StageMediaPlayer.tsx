/**
 * StageMediaPlayer — Persistent Video/Audio Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * ARCHITECTURE:
 *  • ONE <video> element, persistent across questions
 *  • Direct src prop in JSX for instant native browser loading
 *  • Automatic fallback to audio visualizer if video dimensions are 0 (e.g. mp3/m4a audio clips)
 *  • Clean 2D compositor styling (no hardware transform blackouts)
 */

import {
  useRef, useEffect, useCallback, useState,
  forwardRef, useImperativeHandle, memo,
} from 'react';
import { motion } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StageMediaPlayerProps {
  questionId?: string;
  mediaSrc: string;
  videoUrl?: string;
  autoPlayOnMount?: boolean;
}

export interface StageMediaPlayerRef {
  replay: () => Promise<void>;
  pause:  () => void;
  play:   () => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

const StageMediaPlayerComponent = forwardRef<StageMediaPlayerRef, StageMediaPlayerProps>(
  ({ questionId, mediaSrc, videoUrl, autoPlayOnMount = false }, ref) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    // Resolved src
    const resolvedSrc = videoUrl || mediaSrc || '';

    // ── Stable refs ──────────────────────────────────────────────────────────
    const srcRef          = useRef(resolvedSrc);
    const prevSrcRef      = useRef('');
    const autoPlayRef     = useRef(autoPlayOnMount);
    const t0Ref           = useRef(performance.now());
    const rafIdRef        = useRef<number | null>(null);
    const vfcIdRef        = useRef<number | null>(null);

    srcRef.current = resolvedSrc;

    // ── Component State ──────────────────────────────────────────────────────
    const [isLoaded, setIsLoaded]       = useState(false);
    const [isAudioOnly, setIsAudioOnly] = useState(false);
    const [hasError, setHasError]       = useState(false);

    // ── GPU Frame Sync ───────────────────────────────────────────────────────
    const cancelFrameSync = useCallback(() => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      const v = videoRef.current;
      if (v && vfcIdRef.current !== null && 'cancelVideoFrameCallback' in v) {
        (v as any).cancelVideoFrameCallback(vfcIdRef.current);
        vfcIdRef.current = null;
      }
    }, []);

    const startFrameSync = useCallback(() => {
      const v = videoRef.current;
      if (!v) return;
      const onFrame = () => {
        if (!v.paused && !v.ended) {
          if ('requestVideoFrameCallback' in v) {
            vfcIdRef.current = (v as any).requestVideoFrameCallback(onFrame);
          } else {
            rafIdRef.current = requestAnimationFrame(onFrame);
          }
        }
      };
      if ('requestVideoFrameCallback' in v) {
        vfcIdRef.current = (v as any).requestVideoFrameCallback(onFrame);
      } else {
        rafIdRef.current = requestAnimationFrame(onFrame);
      }
    }, []);

    // ── checkVideoState ──────────────────────────────────────────────────────
    const checkVideoState = useCallback(() => {
      const v = videoRef.current;
      if (!v) return;

      if (v.videoWidth > 0 && v.videoHeight > 0) {
        setIsLoaded(true);
        setIsAudioOnly(false);
        setHasError(false);
      } else if (v.readyState >= 2) {
        // Media ready to play audio, but has no video dimensions (e.g. mp3, m4a, audio clip)
        setIsLoaded(true);
        setIsAudioOnly(true);
        setHasError(false);
      }
    }, []);

    // ── safePlay ─────────────────────────────────────────────────────────────
    const safePlay = useCallback(async () => {
      const v = videoRef.current;
      if (!v) return;

      const currentSrc = srcRef.current;
      if (!currentSrc) return;

      if (!v.src || v.src !== currentSrc) {
        v.src = currentSrc;
        v.load();
      }

      if (v.readyState < 3) {
        await new Promise<void>((resolve) => {
          v.addEventListener('canplay', () => resolve(), { once: true });
        });
      }

      v.currentTime = 0;
      v.muted       = false;

      try {
        await v.play();
        checkVideoState();
        const dt = (performance.now() - t0Ref.current).toFixed(0);
        console.log(`[Player] ✅ play() succeeded | startup=${dt}ms | dimensions=${v.videoWidth}x${v.videoHeight}`);
      } catch (err) {
        console.warn('[Player] ⚠ play() blocked:', err);
      }
    }, [checkVideoState]);

    // ── Permanent Event Listeners ────────────────────────────────────────────
    useEffect(() => {
      const v = videoRef.current;
      if (!v) return;

      const handleMetadata = () => {
        console.log(`[Player] loadedmetadata | ${v.videoWidth}x${v.videoHeight}`);
        checkVideoState();
      };

      const handleCanPlay = () => {
        console.log(`[Player] canplay | readyState=${v.readyState} | ${v.videoWidth}x${v.videoHeight}`);
        checkVideoState();

        if (autoPlayRef.current) {
          autoPlayRef.current = false;
          safePlay();
        }
      };

      const handlePlaying = () => {
        console.log(`[Player] 🚀 playing | ${v.videoWidth}x${v.videoHeight}`);
        checkVideoState();
        startFrameSync();
      };

      const handleTimeUpdate = () => {
        checkVideoState();
      };

      const handlePause = () => cancelFrameSync();
      const handleEnded = () => cancelFrameSync();
      const handleError = () => {
        console.error(`[Player] ❌ error:`, v.error);
        setHasError(true);
      };

      v.addEventListener('loadedmetadata', handleMetadata);
      v.addEventListener('loadeddata',     checkVideoState);
      v.addEventListener('canplay',        handleCanPlay);
      v.addEventListener('playing',        handlePlaying);
      v.addEventListener('timeupdate',     handleTimeUpdate);
      v.addEventListener('resize',         checkVideoState);
      v.addEventListener('pause',          handlePause);
      v.addEventListener('ended',          handleEnded);
      v.addEventListener('error',          handleError);

      if (v.readyState >= 1) checkVideoState();

      return () => {
        v.removeEventListener('loadedmetadata', handleMetadata);
        v.removeEventListener('loadeddata',     checkVideoState);
        v.removeEventListener('canplay',        handleCanPlay);
        v.removeEventListener('playing',        handlePlaying);
        v.removeEventListener('timeupdate',     handleTimeUpdate);
        v.removeEventListener('resize',         checkVideoState);
        v.removeEventListener('pause',          handlePause);
        v.removeEventListener('ended',          handleEnded);
        v.removeEventListener('error',          handleError);
        cancelFrameSync();
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Src Change Effect ────────────────────────────────────────────────────
    useEffect(() => {
      const v = videoRef.current;
      if (!v || !resolvedSrc) return;
      if (prevSrcRef.current === resolvedSrc) return;

      prevSrcRef.current  = resolvedSrc;
      autoPlayRef.current = autoPlayOnMount;
      t0Ref.current       = performance.now();

      setIsLoaded(false);
      setIsAudioOnly(false);
      setHasError(false);

      if (!v.paused) v.pause();

      v.src     = resolvedSrc;
      v.preload = 'auto';
      v.load();
    }, [resolvedSrc, questionId, autoPlayOnMount]);

    // ── autoPlayOnMount Effect ───────────────────────────────────────────────
    useEffect(() => {
      autoPlayRef.current = autoPlayOnMount;
      if (!autoPlayOnMount) return;

      const v = videoRef.current;
      if (v && v.src && v.readyState >= 3) {
        autoPlayRef.current = false;
        safePlay();
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoPlayOnMount]);

    // ── Imperative Ref Handle ────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      replay: async () => {
        const v = videoRef.current;
        if (!v) return;
        v.pause();
        v.currentTime = 0;
        await safePlay();
      },
      pause: () => {
        videoRef.current?.pause();
      },
      play: async () => {
        await safePlay();
      },
    }));

    // ── JSX Render ───────────────────────────────────────────────────────────
    return (
      <div
        className="relative flex flex-col items-center justify-center m-auto select-none w-full"
        style={{ maxWidth: '100%' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full overflow-hidden rounded-[24px] backdrop-blur-2xl"
          style={{
            minHeight: '280px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
            border: '2px solid rgba(168,85,247,0.4)',
            boxShadow: '0 24px 70px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.25), 0 0 50px rgba(168,85,247,0.25)',
          }}
        >
          {/* HUD Corner Accents */}
          <div className="pointer-events-none absolute top-3 left-3 h-4 w-4 border-t-2 border-l-2 border-purple-400/70 z-20" />
          <div className="pointer-events-none absolute top-3 right-3 h-4 w-4 border-t-2 border-r-2 border-purple-400/70 z-20" />
          <div className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-purple-400/70 z-20" />
          <div className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-purple-400/70 z-20" />

          {/* Top Light Sweep */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[1px] z-20 opacity-70"
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(192,132,252,0.8) 50%, transparent 100%)' }}
          />

          {/* Loading Spinner Overlay */}
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 pointer-events-none bg-black/60 backdrop-blur-sm">
              <div className="h-10 w-10 rounded-full border-4 border-purple-500/30 border-t-purple-400 animate-spin" />
              <span className="text-[11px] font-bold tracking-widest text-purple-300/80 uppercase">
                Loading media clip...
              </span>
            </div>
          )}

          {/* Error Overlay */}
          {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 pointer-events-none bg-black/80">
              <span className="text-3xl">⚠️</span>
              <span className="text-xs font-bold text-red-400/80 uppercase tracking-widest">
                Could not load clip
              </span>
            </div>
          )}

          {/* Audio-Only Soundstage Visualizer Overlay (for audio files & dialogues) */}
          {isAudioOnly && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20 pointer-events-none bg-[#090b1c]/90 backdrop-blur-md rounded-[24px] p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-3xl shadow-[0_0_30px_rgba(168,85,247,0.5)] animate-pulse">
                🎙️
              </div>
              <div className="flex items-end gap-1.5 h-12">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-gradient-to-t from-purple-500 to-cyan-400 animate-pulse"
                    style={{
                      height: `${15 + Math.sin(i * 0.7) * 25 + 10}px`,
                      animationDelay: `${i * 65}ms`,
                      animationDuration: `${550 + (i % 5) * 80}ms`,
                    }}
                  />
                ))}
              </div>
              <span className="text-xs font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 uppercase">
                🔊 DIALOGUE AUDIO SOUNDSTAGE
              </span>
            </div>
          )}

          {/* Video Container */}
          <div
            className="relative overflow-hidden bg-black rounded-[24px] flex items-center justify-center w-full"
            style={{ minHeight: '280px', maxHeight: '75vh' }}
          >
            {/*
             * ALWAYS VISIBLE VIDEO ELEMENT
             * Standard 2D compositor styling (no translateZ transform blackout)
             */}
            <video
              ref={videoRef}
              src={resolvedSrc || undefined}
              controls={false}
              playsInline
              preload="auto"
              disablePictureInPicture
              controlsList="nofullscreen noremoteplayback nodownload noplaybackrate"
              style={{
                display: isAudioOnly ? 'none' : 'block',
                width: '100%',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: '75vh',
                minHeight: '280px',
                objectFit: 'contain',
                borderRadius: '24px',
              }}
              className="movie-player pointer-events-none select-none"
            />

            {/* Status Badge */}
            <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-purple-500/20 border border-purple-500/50 px-3.5 py-1 text-xs font-bold text-purple-300 backdrop-blur-md shadow-lg shadow-purple-500/20 pointer-events-none z-30">
              <span className={`h-2 w-2 rounded-full ${isLoaded ? 'bg-green-400' : 'bg-purple-400 animate-pulse'}`} />
              {isAudioOnly ? 'AUDIO STAGE' : 'MOVIE VIDEO STAGE'}
            </div>
          </div>
        </motion.div>
      </div>
    );
  },
);

StageMediaPlayerComponent.displayName = 'StageMediaPlayer';

export const StageMediaPlayer = memo(
  StageMediaPlayerComponent,
  (prev, next) =>
    prev.questionId      === next.questionId      &&
    prev.videoUrl        === next.videoUrl        &&
    prev.mediaSrc        === next.mediaSrc        &&
    prev.autoPlayOnMount === next.autoPlayOnMount,
);
