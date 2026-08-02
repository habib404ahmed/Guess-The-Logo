/**
 * StageMediaPlayer — Zero-Delay Video Engine
 * ───────────────────────────────────────────────────────────────────────────
 * KEY ARCHITECTURE DECISIONS:
 *  1. ONE persistent <video> element — never unmounted, never recreated
 *  2. src set both in JSX (immediate, synchronous) AND via imperative ref
 *  3. video.load() fires IMMEDIATELY when src is assigned (before countdown)
 *  4. play() is called ONLY after readyState >= 3 OR canplay event
 *  5. React.memo blocks all re-renders from timer/score/progress changes
 *  6. requestVideoFrameCallback (or rAF fallback) drives GPU frame sync
 */

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle, memo } from 'react';
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

    // ── Diagnostics Refs (never cause re-renders) ───────────────────────────
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

    // ── Resolve stable video source ─────────────────────────────────────────
    // videoUrl and mediaSrc are already the blob:// Object URLs created in storage.ts
    const resolvedSrc = videoUrl || mediaSrc || '';

    // ── GPU frame sync loop ──────────────────────────────────────────────────
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

    // ── safePlay: wait for readyState ≥ 3, then play() ──────────────────────
    const safePlay = useCallback(async () => {
      const v = videoRef.current;
      if (!v) return;

      // Make absolutely sure the video has a src before trying to play
      if (!v.src && resolvedSrc) {
        v.src = resolvedSrc;
        v.load();
      }

      if (!v.src) {
        console.warn('[StageMediaPlayer] safePlay called but video.src is empty — skipping');
        return;
      }

      console.log('[Diagnostics] video.readyState   =', v.readyState);
      console.log('[Diagnostics] video.networkState =', v.networkState);
      console.log('[Diagnostics] video.currentSrc   =', v.currentSrc?.slice(0, 80));

      if (v.readyState >= 3) {
        console.log('[Diagnostics] readyState >= HAVE_FUTURE_DATA — playing immediately');
      } else {
        console.log(`[Diagnostics] Waiting for canplay... (readyState=${v.readyState})`);
        await new Promise<void>((resolve) => {
          const handler = () => resolve();
          v.addEventListener('canplay', handler, { once: true });
        });
      }

      playTimeRef.current = performance.now();
      if (canPlayTimeRef.current !== null) {
        console.log(
          `[Diagnostics] Time from canplay → play(): ${(playTimeRef.current - canPlayTimeRef.current).toFixed(2)} ms`,
        );
      }

      v.currentTime = 0;
      v.muted = false;

      try {
        await v.play();
        console.log('[Diagnostics] ✅ play() succeeded');
      } catch (err) {
        console.warn('[Diagnostics] ⚠ play() failed:', err);
      }
    }, [resolvedSrc]);

    // ── Permanent event listeners (attached once on mount) ───────────────────
    useEffect(() => {
      const v = videoRef.current;
      if (!v) return;

      const onCanPlay = () => {
        canPlayTimeRef.current = performance.now();
        const elapsed = (canPlayTimeRef.current - questionLoadTimeRef.current).toFixed(2);
        console.log(`[Diagnostics] ✅ canplay fired | load → canplay: ${elapsed} ms`);

        if (autoPlayPendingRef.current) {
          autoPlayPendingRef.current = false;
          safePlay();
        }
      };

      const onPlaying = () => {
        const now = performance.now();
        if (playTimeRef.current !== null) {
          console.log(`[Diagnostics] ✅ playing | play() → first frame: ${(now - playTimeRef.current).toFixed(2)} ms`);
        }
        console.log(`[Diagnostics] 🚀 TOTAL STARTUP DELAY: ${(now - questionLoadTimeRef.current).toFixed(2)} ms`);
        scheduleFrameSync();
      };

      const onPause = () => cancelFrameCallbacks();
      const onEnded = () => cancelFrameCallbacks();

      v.addEventListener('canplay', onCanPlay);
      v.addEventListener('playing', onPlaying);
      v.addEventListener('pause',   onPause);
      v.addEventListener('ended',   onEnded);

      return () => {
        v.removeEventListener('canplay', onCanPlay);
        v.removeEventListener('playing', onPlaying);
        v.removeEventListener('pause',   onPause);
        v.removeEventListener('ended',   onEnded);
        cancelFrameCallbacks();
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // permanent — runs once

    // ── Src change: imperatively assign src + call load() immediately ────────
    useEffect(() => {
      const v = videoRef.current;
      if (!v || !resolvedSrc) return;

      // Skip if src is identical (blob URLs are stable per question)
      if (prevSrcRef.current === resolvedSrc) return;
      prevSrcRef.current = resolvedSrc;

      // Reset diagnostics
      questionLoadTimeRef.current = performance.now();
      canPlayTimeRef.current      = null;
      playTimeRef.current         = null;
      autoPlayPendingRef.current  = autoPlayOnMount;

      console.log(`[Diagnostics] 📼 New src detected | questionId=${questionId}`);
      console.log(`[Diagnostics] src = ${resolvedSrc.slice(0, 80)}`);

      // Pause current playback cleanly
      if (!v.paused) v.pause();

      // Assign src then immediately start buffering (don't wait for countdown)
      v.src     = resolvedSrc;
      v.preload = 'auto';
      v.load();

      console.log(`[Diagnostics] video.load() called at ${performance.now().toFixed(2)} ms`);
    }, [resolvedSrc, questionId, autoPlayOnMount]);

    // ── autoPlayOnMount change → trigger play if already buffered ────────────
    useEffect(() => {
      autoPlayPendingRef.current = autoPlayOnMount;

      if (autoPlayOnMount) {
        const v = videoRef.current;
        if (v && v.src && v.readyState >= 3) {
          autoPlayPendingRef.current = false;
          safePlay();
        }
        // else canplay handler will fire safePlay when ready
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
        className="relative flex flex-col items-center justify-center m-auto select-none"
        style={{ width: 'fit-content', height: 'fit-content', maxWidth: '100%', maxHeight: '75vh' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative flex items-center justify-center overflow-hidden rounded-[24px] backdrop-blur-2xl group"
          style={{
            width: 'fit-content',
            height: 'fit-content',
            maxWidth: '100%',
            maxHeight: '75vh',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
            border: '2px solid rgba(168,85,247,0.4)',
            boxShadow:
              '0 24px 70px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.25), 0 0 50px rgba(168,85,247,0.25)',
          }}
        >
          {/* Futuristic HUD Corner Accents */}
          <div className="pointer-events-none absolute top-3 left-3 h-4 w-4 border-t-2 border-l-2 border-purple-400/70 z-20" />
          <div className="pointer-events-none absolute top-3 right-3 h-4 w-4 border-t-2 border-r-2 border-purple-400/70 z-20" />
          <div className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-purple-400/70 z-20" />
          <div className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-purple-400/70 z-20" />

          {/* Top Light Sweep Highlight */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[1px] z-20 opacity-70"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(192,132,252,0.8) 50%, transparent 100%)',
            }}
          />

          {/* GPU-Accelerated Video Container */}
          <div
            className="relative overflow-hidden bg-black/90 rounded-[24px] flex items-center justify-center"
            style={{ width: 'fit-content', height: 'fit-content', maxWidth: '100%', maxHeight: '75vh' }}
          >
            {/*
             * SINGLE PERSISTENT <video> — src set synchronously via JSX prop.
             * useEffect also assigns src imperatively for question transitions.
             * Both paths ensure the video always has a valid src on first paint.
             */}
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
                width: 'auto',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: '75vh',
                objectFit: 'contain',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                willChange: 'transform',
                contain: 'layout paint size',
                borderRadius: '24px',
              }}
              className="movie-player pointer-events-none select-none"
              onError={(e) => {
                console.error('[Video Error]', (e.target as HTMLVideoElement)?.error, resolvedSrc?.slice(0, 80));
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
 * Memoized — re-renders ONLY when questionId / mediaSrc / videoUrl / autoPlayOnMount changes.
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
