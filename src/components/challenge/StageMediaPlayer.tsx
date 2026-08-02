/**
 * StageMediaPlayer — Zero-Delay Video Engine
 * ───────────────────────────────────────────────────────────────────────────
 * KEY ARCHITECTURE DECISIONS:
 *  1. ONE persistent <video> element — never unmounted, never recreated
 *  2. Object URL in-memory cache — one createObjectURL per questionId, ever
 *  3. video.load() fires IMMEDIATELY when src is assigned (before countdown)
 *  4. play() is called ONLY after readyState >= 3 OR canplay event
 *  5. React.memo blocks all re-renders from timer/score/progress changes
 *  6. requestVideoFrameCallback (or rAF fallback) drives GPU frame sync
 */

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle, memo } from 'react';
import { motion } from 'framer-motion';

// ─── In-Process Object URL Cache (survives re-renders, never GC'd) ────────────
const objectUrlCache = new Map<string, string>();

export function cacheObjectUrl(questionId: string, url: string): void {
  if (!objectUrlCache.has(questionId)) {
    objectUrlCache.set(questionId, url);
  }
}

export function getCachedObjectUrl(questionId: string): string | undefined {
  return objectUrlCache.get(questionId);
}

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
    const renderCountRef       = useRef(0);
    const questionLoadTimeRef  = useRef(0);
    const canPlayTimeRef       = useRef<number | null>(null);
    const playTimeRef          = useRef<number | null>(null);
    const currentSrcRef        = useRef('');
    const animFrameIdRef       = useRef<number | null>(null);
    const frameCallbackIdRef   = useRef<number | null>(null);
    const autoPlayPendingRef   = useRef(autoPlayOnMount);

    renderCountRef.current += 1;
    console.log(`[Diagnostics] StageMediaPlayer render #${renderCountRef.current} | questionId=${questionId}`);

    // Resolve stable video source — prefer cache hit, then fallback to prop
    const resolvedSrc = (questionId && objectUrlCache.get(questionId)) || videoUrl || mediaSrc || '';

    // ── safePlay: wait for readyState ≥ 3 then call play() ──────────────────
    const safePlay = useCallback(async () => {
      const v = videoRef.current;
      if (!v || !v.src) return;

      const bufferedEnd = v.buffered.length > 0 ? v.buffered.end(v.buffered.length - 1) : 0;
      console.log('[Diagnostics] video.readyState   =', v.readyState);
      console.log('[Diagnostics] video.networkState =', v.networkState);
      console.log('[Diagnostics] video.buffered.end =', bufferedEnd.toFixed(2), 's');
      console.log('[Diagnostics] video.currentSrc   =', v.currentSrc?.slice(0, 60));

      // If already at readyState >= 3, play immediately (< 1 ms)
      if (v.readyState >= 3) {
        console.log('[Diagnostics] readyState already HAVE_FUTURE_DATA — playing immediately');
      } else {
        console.log(`[Diagnostics] Waiting for canplay... (readyState=${v.readyState})`);
        await new Promise<void>((resolve) => {
          const handler = () => resolve();
          v.addEventListener('canplay', handler, { once: true });
        });
      }

      playTimeRef.current = performance.now();
      if (canPlayTimeRef.current !== null) {
        console.log(`[Diagnostics] Time from canplay → play(): ${(playTimeRef.current - canPlayTimeRef.current).toFixed(2)} ms`);
      }

      v.currentTime = 0;
      v.muted = false;

      try {
        await v.play();
        console.log('[Diagnostics] ✅ play() succeeded — video is now playing');
      } catch (err) {
        console.warn('[Diagnostics] ⚠ play() failed (autoplay policy?):', err);
      }
    }, []);

    // ── Cancel any active frame callbacks ───────────────────────────────────
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

    // ── GPU frame sync loop (requestVideoFrameCallback or rAF fallback) ─────
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

    // ── Mount: attach persistent event listeners once ────────────────────────
    useEffect(() => {
      const v = videoRef.current;
      if (!v) return;

      const onCanPlay = () => {
        canPlayTimeRef.current = performance.now();
        console.log(
          `[Diagnostics] ✅ canplay fired | Time from load → canplay: ${(canPlayTimeRef.current - questionLoadTimeRef.current).toFixed(2)} ms`,
        );

        // If autoplay is pending, play NOW
        if (autoPlayPendingRef.current) {
          autoPlayPendingRef.current = false;
          safePlay();
        }
      };

      const onPlaying = () => {
        const firstFrameTime = performance.now();
        if (playTimeRef.current !== null) {
          console.log(
            `[Diagnostics] ✅ playing fired | Time from play() → first frame: ${(firstFrameTime - playTimeRef.current).toFixed(2)} ms`,
          );
        }
        const totalStartup = firstFrameTime - questionLoadTimeRef.current;
        console.log(`[Diagnostics] 🚀 TOTAL STARTUP DELAY: ${totalStartup.toFixed(2)} ms`);
        scheduleFrameSync();
      };

      const onPause = () => cancelFrameCallbacks();
      const onEnded = () => cancelFrameCallbacks();

      v.addEventListener('canplay',  onCanPlay);
      v.addEventListener('playing',  onPlaying);
      v.addEventListener('pause',    onPause);
      v.addEventListener('ended',    onEnded);

      return () => {
        v.removeEventListener('canplay',  onCanPlay);
        v.removeEventListener('playing',  onPlaying);
        v.removeEventListener('pause',    onPause);
        v.removeEventListener('ended',    onEnded);
        cancelFrameCallbacks();
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // ← INTENTIONAL: listeners are permanent, attached once at mount

    // ── Src change: assign src + call load() IMMEDIATELY ────────────────────
    useEffect(() => {
      const v = videoRef.current;
      if (!v || !resolvedSrc) return;

      // Skip if src hasn't actually changed
      if (currentSrcRef.current === resolvedSrc) return;
      currentSrcRef.current = resolvedSrc;

      // Reset diagnostics for this question
      questionLoadTimeRef.current = performance.now();
      canPlayTimeRef.current      = null;
      playTimeRef.current         = null;
      autoPlayPendingRef.current  = autoPlayOnMount;

      console.log(`[Diagnostics] 📼 Assigning new src, calling load() immediately | questionId=${questionId}`);
      console.log(`[Diagnostics] src = ${resolvedSrc.slice(0, 60)}...`);

      // Pause any current playback
      if (!v.paused) v.pause();

      // Assign src and immediately preload the stream
      v.src     = resolvedSrc;
      v.preload = 'auto';
      v.load(); // ← fires immediately, no waiting for countdowns

      console.log(`[Diagnostics] video.load() called at ${performance.now().toFixed(2)} ms`);
    }, [resolvedSrc, questionId, autoPlayOnMount]);

    // ── autoPlayOnMount prop change: update the pending flag ────────────────
    useEffect(() => {
      autoPlayPendingRef.current = autoPlayOnMount;

      // If already canplay and autoplay was requested, play immediately
      if (autoPlayOnMount) {
        const v = videoRef.current;
        if (v && v.readyState >= 3) {
          autoPlayPendingRef.current = false;
          safePlay();
        }
      }
    }, [autoPlayOnMount, safePlay]);

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
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
            border: '2px solid rgba(168,85,247,0.4)',
            boxShadow: '0 24px 70px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.25), 0 0 50px rgba(168,85,247,0.25)',
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
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(192,132,252,0.8) 50%, transparent 100%)' }}
          />

          {/* GPU-Accelerated Video Container */}
          <div
            className="relative overflow-hidden bg-black/90 rounded-[24px] flex items-center justify-center"
            style={{ width: 'fit-content', height: 'fit-content', maxWidth: '100%', maxHeight: '75vh' }}
          >
            {/*
             * SINGLE PERSISTENT <video> ELEMENT
             * - Never unmounted (no key prop changes)
             * - src is swapped via videoRef.current.src = ... in useEffect
             * - preload="auto" set via JS to ensure it's always honoured
             * - Hardware-layer compositing: translateZ(0), backfaceVisibility, contain
             */}
            <video
              ref={videoRef}
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
 * Memoized export — re-renders ONLY when questionId or mediaSrc/videoUrl changes.
 * Timer ticks, score updates, countdown changes → NEVER cause a video re-render.
 */
export const StageMediaPlayer = memo(
  StageMediaPlayerComponent,
  (prev, next) =>
    prev.questionId      === next.questionId &&
    prev.videoUrl        === next.videoUrl &&
    prev.mediaSrc        === next.mediaSrc &&
    prev.autoPlayOnMount === next.autoPlayOnMount,
);
