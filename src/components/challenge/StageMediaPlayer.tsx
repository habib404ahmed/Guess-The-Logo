/**
 * StageMediaPlayer — Zero-Delay Video Engine
 * ───────────────────────────────────────────────────────────────────────────
 * KEY ARCHITECTURE DECISIONS:
 *  1. ONE persistent <video> element — never unmounted, never recreated
 *  2. src set in JSX (synchronous) + imperatively in useEffect for transitions
 *  3. video.load() fires IMMEDIATELY on src assignment (before countdown)
 *  4. play() only after readyState >= 3 OR canplay event
 *  5. React.memo blocks re-renders from timer/score/progress
 *  6. Loading skeleton shown until metadata is loaded (prevents 0×0 collapse)
 */

import { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle, memo } from 'react';
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
  pause: () => void;
  play: () => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

const StageMediaPlayerComponent = forwardRef<StageMediaPlayerRef, StageMediaPlayerProps>(
  ({ questionId, mediaSrc, videoUrl, autoPlayOnMount = false }, ref) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    // Loading state — prevents 0×0 collapse when video metadata not yet loaded
    const [videoReady, setVideoReady] = useState(false);

    // ── Diagnostics Refs ────────────────────────────────────────────────────
    const renderCountRef      = useRef(0);
    const questionLoadTimeRef = useRef(performance.now());
    const canPlayTimeRef      = useRef<number | null>(null);
    const playTimeRef         = useRef<number | null>(null);
    const prevSrcRef          = useRef('');
    const animFrameIdRef      = useRef<number | null>(null);
    const frameCallbackIdRef  = useRef<number | null>(null);
    const autoPlayPendingRef  = useRef(autoPlayOnMount);

    renderCountRef.current += 1;
    console.log(`[Diagnostics] StageMediaPlayer render #${renderCountRef.current} | questionId=${questionId}`);

    // ── Resolve stable video src ────────────────────────────────────────────
    const resolvedSrc = videoUrl || mediaSrc || '';

    // ── GPU frame sync ──────────────────────────────────────────────────────
    const cancelFrameCallbacks = useCallback(() => {
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      const v = videoRef.current;
      if (v && frameCallbackIdRef.current !== null && 'cancelVideoFrameCallback' in v) {
        (v as any).cancelVideoFrameCallback(frameCallbackIdRef.current);
        frameCallbackIdRef.current = null;
      }
    }, []);

    const scheduleFrameSync = useCallback(() => {
      const v = videoRef.current;
      if (!v) return;
      const onFrame = () => {
        if (!v.paused && !v.ended) {
          if ('requestVideoFrameCallback' in v) {
            frameCallbackIdRef.current = (v as any).requestVideoFrameCallback(onFrame);
          } else {
            animFrameIdRef.current = requestAnimationFrame(onFrame);
          }
        }
      };
      if ('requestVideoFrameCallback' in v) {
        frameCallbackIdRef.current = (v as any).requestVideoFrameCallback(onFrame);
      } else {
        animFrameIdRef.current = requestAnimationFrame(onFrame);
      }
    }, []);

    // ── safePlay ────────────────────────────────────────────────────────────
    const safePlay = useCallback(async () => {
      const v = videoRef.current;
      if (!v) return;

      if (!v.src && resolvedSrc) {
        v.src = resolvedSrc;
        v.load();
      }
      if (!v.src) {
        console.warn('[StageMediaPlayer] safePlay: no video src, skipping');
        return;
      }

      console.log('[Diagnostics] readyState=', v.readyState, 'networkState=', v.networkState);

      if (v.readyState >= 3) {
        console.log('[Diagnostics] Already HAVE_FUTURE_DATA — playing immediately');
      } else {
        console.log('[Diagnostics] Waiting for canplay...');
        await new Promise<void>((resolve) => {
          v.addEventListener('canplay', () => resolve(), { once: true });
        });
      }

      playTimeRef.current = performance.now();
      if (canPlayTimeRef.current !== null) {
        console.log(`[Diagnostics] canplay → play(): ${(playTimeRef.current - canPlayTimeRef.current).toFixed(2)}ms`);
      }

      v.currentTime = 0;
      v.muted = false;

      try {
        await v.play();
        console.log('[Diagnostics] ✅ play() succeeded');
      } catch (err) {
        console.warn('[Diagnostics] ⚠ play() blocked:', err);
      }
    }, [resolvedSrc]);

    // ── Permanent event listeners (once, on mount) ───────────────────────────
    useEffect(() => {
      const v = videoRef.current;
      if (!v) return;

      const onLoadedMetadata = () => {
        console.log(`[Diagnostics] loadedmetadata: ${v.videoWidth}×${v.videoHeight}`);
        setVideoReady(true);
      };

      const onCanPlay = () => {
        canPlayTimeRef.current = performance.now();
        console.log(`[Diagnostics] canplay | load→canplay: ${(canPlayTimeRef.current - questionLoadTimeRef.current).toFixed(2)}ms`);
        if (autoPlayPendingRef.current) {
          autoPlayPendingRef.current = false;
          safePlay();
        }
      };

      const onPlaying = () => {
        const now = performance.now();
        if (playTimeRef.current !== null) {
          console.log(`[Diagnostics] play()→first frame: ${(now - playTimeRef.current).toFixed(2)}ms`);
        }
        console.log(`[Diagnostics] 🚀 TOTAL STARTUP: ${(now - questionLoadTimeRef.current).toFixed(2)}ms`);
        scheduleFrameSync();
      };

      const onPause = () => cancelFrameCallbacks();
      const onEnded = () => cancelFrameCallbacks();

      v.addEventListener('loadedmetadata', onLoadedMetadata);
      v.addEventListener('canplay',        onCanPlay);
      v.addEventListener('playing',        onPlaying);
      v.addEventListener('pause',          onPause);
      v.addEventListener('ended',          onEnded);

      return () => {
        v.removeEventListener('loadedmetadata', onLoadedMetadata);
        v.removeEventListener('canplay',        onCanPlay);
        v.removeEventListener('playing',        onPlaying);
        v.removeEventListener('pause',          onPause);
        v.removeEventListener('ended',          onEnded);
        cancelFrameCallbacks();
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionally permanent

    // ── Src change: assign + load() immediately ──────────────────────────────
    useEffect(() => {
      const v = videoRef.current;
      if (!v || !resolvedSrc) return;

      if (prevSrcRef.current === resolvedSrc) return;
      prevSrcRef.current = resolvedSrc;

      // Reset state for new question
      setVideoReady(false);
      questionLoadTimeRef.current = performance.now();
      canPlayTimeRef.current      = null;
      playTimeRef.current         = null;
      autoPlayPendingRef.current  = autoPlayOnMount;

      console.log(`[Diagnostics] 📼 New src | questionId=${questionId} | ${resolvedSrc.slice(0, 60)}`);

      if (!v.paused) v.pause();

      // Assign and immediately start buffering
      v.src     = resolvedSrc;
      v.preload = 'auto';
      v.load();

      console.log(`[Diagnostics] load() called at ${performance.now().toFixed(2)}ms`);
    }, [resolvedSrc, questionId, autoPlayOnMount]);

    // ── autoPlayOnMount change ───────────────────────────────────────────────
    useEffect(() => {
      autoPlayPendingRef.current = autoPlayOnMount;
      if (autoPlayOnMount) {
        const v = videoRef.current;
        if (v && v.src && v.readyState >= 3) {
          autoPlayPendingRef.current = false;
          safePlay();
        }
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoPlayOnMount]);

    // ── Imperative API ───────────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      replay: async () => {
        const v = videoRef.current;
        if (!v) return;
        v.pause();
        v.currentTime = 0;
        await safePlay();
      },
      pause: () => {
        if (videoRef.current) videoRef.current.pause();
      },
      play: async () => {
        await safePlay();
      },
    }));

    // ── JSX ──────────────────────────────────────────────────────────────────
    return (
      <div
        className="relative flex flex-col items-center justify-center m-auto select-none w-full"
        style={{ maxWidth: '100%', maxHeight: '80vh' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative flex items-center justify-center overflow-hidden rounded-[24px] backdrop-blur-2xl w-full"
          style={{
            minHeight: '220px',
            maxWidth: '100%',
            maxHeight: '80vh',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
            border: '2px solid rgba(168,85,247,0.4)',
            boxShadow:
              '0 24px 70px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.25), 0 0 50px rgba(168,85,247,0.25)',
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
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(192,132,252,0.8) 50%, transparent 100%)',
            }}
          />

          {/* Loading Skeleton — shown until video metadata is ready */}
          {!videoReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 pointer-events-none">
              <div className="h-12 w-12 rounded-full border-4 border-purple-500/30 border-t-purple-400 animate-spin" />
              <span className="text-xs font-bold tracking-widest text-purple-300 uppercase">
                Loading clip...
              </span>
            </div>
          )}

          {/* GPU-Accelerated Video */}
          <div
            className="relative overflow-hidden bg-black/90 rounded-[24px] flex items-center justify-center w-full"
            style={{ maxHeight: '80vh' }}
          >
            <video
              ref={videoRef}
              src={resolvedSrc || undefined}
              controls={false}
              playsInline
              muted={false}
              preload="auto"
              disablePictureInPicture
              controlsList="nofullscreen noremoteplayback nodownload noplaybackrate"
              style={{
                display: 'block',
                width: videoReady ? 'auto' : '100%',
                height: videoReady ? 'auto' : '220px',
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                willChange: 'transform',
                contain: 'layout paint size',
                borderRadius: '24px',
                opacity: videoReady ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}
              className="movie-player pointer-events-none select-none"
              onError={(e) => {
                console.error('[Video Error]', (e.target as HTMLVideoElement)?.error?.message, resolvedSrc?.slice(0, 80));
              }}
            />

            {/* Status Badge */}
            <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-purple-500/20 border border-purple-500/50 px-3.5 py-1 text-xs font-bold text-purple-300 backdrop-blur-md shadow-lg shadow-purple-500/20 pointer-events-none z-30">
              <span className="h-2 w-2 rounded-full bg-purple-400" />
              MOVIE VIDEO STAGE
            </div>
          </div>
        </motion.div>
      </div>
    );
  },
);

StageMediaPlayerComponent.displayName = 'StageMediaPlayer';

/**
 * Memoized — re-renders ONLY when questionId/mediaSrc/videoUrl/autoPlayOnMount changes.
 * Timer ticks, score updates, progress → ZERO video re-renders.
 */
export const StageMediaPlayer = memo(
  StageMediaPlayerComponent,
  (prev, next) =>
    prev.questionId      === next.questionId &&
    prev.videoUrl        === next.videoUrl &&
    prev.mediaSrc        === next.mediaSrc &&
    prev.autoPlayOnMount === next.autoPlayOnMount,
);
