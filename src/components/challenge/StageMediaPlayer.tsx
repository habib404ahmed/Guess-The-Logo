/**
 * StageMediaPlayer — Persistent Video/Audio Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * ARCHITECTURE:
 *  • ONE <video> element, never unmounted (forwardRef + React.memo)
 *  • src set ONLY imperatively via videoRef — React never touches it after mount
 *  • video.load() called immediately on src change (pre-buffers before countdown)
 *  • play() only after readyState >= HAVE_FUTURE_DATA (3) or canplay event
 *  • Handles both VIDEO files (shows frame) and AUDIO-ONLY files (waveform UI)
 *  • No stale closures — all event handler refs are refreshed via useRef
 *
 * FIXES:
 *  BUG #2 — Audio-only files (mp3, m4a) had videoWidth=0 → 0×0 collapse
 *            Fixed: detect audio-only and show audio-player UI instead
 *  BUG #4 — safePlay had stale closure on resolvedSrc
 *            Fixed: resolvedSrc stored in a ref, always current
 *  BUG #5 — loadedmetadata could fire before listeners attached
 *            Fixed: check readyState on mount and in src-change effect
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

type LoadState = 'idle' | 'loading' | 'ready' | 'audio-only' | 'error';

// ─── Component ────────────────────────────────────────────────────────────────

const StageMediaPlayerComponent = forwardRef<StageMediaPlayerRef, StageMediaPlayerProps>(
  ({ questionId, mediaSrc, videoUrl, autoPlayOnMount = false }, ref) => {
    const videoRef   = useRef<HTMLVideoElement | null>(null);

    // ── Stable refs (never cause re-renders) ────────────────────────────────
    const srcRef            = useRef('');        // always-current src
    const prevSrcRef        = useRef('');        // previously loaded src (for change detection)
    const autoPlayRef       = useRef(autoPlayOnMount);
    const canPlayFiredRef   = useRef(false);
    const t0Ref             = useRef(performance.now());

    // ── Visible state (minimal — only what must trigger re-render) ──────────
    const [loadState, setLoadState] = useState<LoadState>('idle');

    // Resolved src — prefer videoUrl over mediaSrc
    const resolvedSrc = videoUrl || mediaSrc || '';
    srcRef.current    = resolvedSrc; // keep ref in sync (no closure staleness)

    // ─── GPU frame sync ─────────────────────────────────────────────────────
    const rafIdRef = useRef<number | null>(null);
    const vfcIdRef = useRef<number | null>(null);

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

    // ─── safePlay — no stale closure (reads srcRef, not prop directly) ──────
    // FIX BUG #4: Use srcRef.current instead of capturing resolvedSrc in closure.
    const safePlay = useCallback(async () => {
      const v = videoRef.current;
      if (!v) return;

      const currentSrc = srcRef.current;
      if (!currentSrc) {
        console.warn('[Player] safePlay called with no src — skipping');
        return;
      }

      // Ensure video element has the correct src
      if (!v.src || v.src !== currentSrc) {
        v.src = currentSrc;
        v.load();
        canPlayFiredRef.current = false;
      }

      console.log(`[Player] safePlay | readyState=${v.readyState} src=${currentSrc.slice(0, 50)}`);

      if (v.readyState < 3) {
        console.log('[Player] Waiting for canplay...');
        await new Promise<void>((resolve) => {
          v.addEventListener('canplay', () => resolve(), { once: true });
        });
      }

      v.currentTime = 0;
      v.muted       = false;

      try {
        await v.play();
        const dt = (performance.now() - t0Ref.current).toFixed(0);
        console.log(`[Player] ✅ play() OK | startup=${dt}ms`);
      } catch (err) {
        console.warn('[Player] ⚠ play() blocked by autoplay policy:', err);
      }
    }, []); // ← no deps — reads everything via refs

    // ─── Permanent event listeners (attached ONCE at mount) ─────────────────
    // FIX BUG #5: Check readyState immediately after attaching, in case
    // loadedmetadata already fired before our listener was added.
    useEffect(() => {
      const v = videoRef.current;
      if (!v) return;

      const onLoadedMetadata = () => {
        const isAudioOnly = v.videoWidth === 0 || v.videoHeight === 0;
        console.log(`[Player] loadedmetadata | ${v.videoWidth}×${v.videoHeight} | ${isAudioOnly ? 'AUDIO-ONLY' : 'VIDEO'}`);
        setLoadState(isAudioOnly ? 'audio-only' : 'ready');
      };

      const onCanPlay = () => {
        const dt = (performance.now() - t0Ref.current).toFixed(0);
        console.log(`[Player] canplay | dt=${dt}ms | readyState=${v.readyState}`);
        canPlayFiredRef.current = true;

        // If metadata says it's a valid video, mark as ready
        if (v.videoWidth > 0 || v.videoHeight > 0) {
          setLoadState('ready');
        }

        // Trigger autoplay if pending
        if (autoPlayRef.current) {
          autoPlayRef.current = false;
          safePlay();
        }
      };

      const onPlaying = () => {
        const dt = (performance.now() - t0Ref.current).toFixed(0);
        console.log(`[Player] 🚀 playing | total_startup=${dt}ms`);
        startFrameSync();
      };

      const onPause  = () => cancelFrameSync();
      const onEnded  = () => { cancelFrameSync(); console.log('[Player] ended'); };
      const onError  = () => {
        const err = v.error;
        console.error(`[Player] ❌ error | code=${err?.code} msg=${err?.message} src=${v.src?.slice(0, 60)}`);
        setLoadState('error');
      };

      v.addEventListener('loadedmetadata', onLoadedMetadata);
      v.addEventListener('canplay',        onCanPlay);
      v.addEventListener('playing',        onPlaying);
      v.addEventListener('pause',          onPause);
      v.addEventListener('ended',          onEnded);
      v.addEventListener('error',          onError);

      // FIX BUG #5: If the browser already loaded metadata before we attached
      // listeners (e.g. from memory cache), check immediately.
      if (v.readyState >= 1 && v.src) {
        onLoadedMetadata();
      }
      if (v.readyState >= 3 && v.src) {
        onCanPlay();
      }

      return () => {
        v.removeEventListener('loadedmetadata', onLoadedMetadata);
        v.removeEventListener('canplay',        onCanPlay);
        v.removeEventListener('playing',        onPlaying);
        v.removeEventListener('pause',          onPause);
        v.removeEventListener('ended',          onEnded);
        v.removeEventListener('error',          onError);
        cancelFrameSync();
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // ← intentionally permanent

    // ─── Src change effect — assigns src + starts buffering immediately ──────
    useEffect(() => {
      const v = videoRef.current;
      if (!v || !resolvedSrc) return;
      if (prevSrcRef.current === resolvedSrc) return; // same question, skip

      prevSrcRef.current      = resolvedSrc;
      canPlayFiredRef.current = false;
      autoPlayRef.current     = autoPlayOnMount;
      t0Ref.current           = performance.now();

      console.log(`[Player] 📼 New src | id=${questionId} autoPlay=${autoPlayOnMount} | ${resolvedSrc.slice(0, 60)}`);

      // Reset visual state for new question
      setLoadState('loading');

      // Stop current playback cleanly
      if (!v.paused) v.pause();

      // Assign src imperatively (React does NOT touch src after mount)
      v.src     = resolvedSrc;
      v.preload = 'auto';
      v.load();

      console.log(`[Player] load() called | t=${performance.now().toFixed(0)}ms`);
    }, [resolvedSrc, questionId, autoPlayOnMount]);

    // ─── autoPlayOnMount change (countdown finished → trigger play) ──────────
    useEffect(() => {
      autoPlayRef.current = autoPlayOnMount;

      if (!autoPlayOnMount) return;

      const v = videoRef.current;
      if (!v || !v.src) return;

      if (v.readyState >= 3) {
        // Already buffered — play immediately
        autoPlayRef.current = false;
        safePlay();
      }
      // else: canplay handler will fire safePlay when ready
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoPlayOnMount]);

    // ─── Imperative API ──────────────────────────────────────────────────────
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

    // ─── Derived display state ───────────────────────────────────────────────
    const isLoading   = loadState === 'idle' || loadState === 'loading';
    const isAudioOnly = loadState === 'audio-only';
    const hasError    = loadState === 'error';
    const isReady     = loadState === 'ready';

    // ─── JSX ─────────────────────────────────────────────────────────────────
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
            minHeight: '240px',
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

          {/* ── Loading Overlay ── */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 pointer-events-none">
              <div className="h-10 w-10 rounded-full border-4 border-purple-500/30 border-t-purple-400 animate-spin" />
              <span className="text-[11px] font-bold tracking-widest text-purple-300/80 uppercase">
                Loading clip...
              </span>
            </div>
          )}

          {/* ── Error State ── */}
          {hasError && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 pointer-events-none">
              <span className="text-3xl">⚠️</span>
              <span className="text-xs font-bold text-red-400/80 uppercase tracking-widest">
                Could not load clip
              </span>
              <span className="text-[10px] text-slate-500 max-w-[200px] text-center">
                Re-import this video in the Admin Panel
              </span>
            </div>
          )}

          {/* ── Audio-Only Visualizer (FIX BUG #2) ── */}
          {/* Shown when an audio file (mp3/m4a/wav) is loaded instead of a video file */}
          {isAudioOnly && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 pointer-events-none">
              <div className="flex items-end gap-1 h-12">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-purple-400 animate-pulse"
                    style={{
                      height: `${20 + Math.sin(i * 0.8) * 18 + 10}px`,
                      animationDelay: `${i * 80}ms`,
                      animationDuration: `${600 + i * 60}ms`,
                    }}
                  />
                ))}
              </div>
              <span className="text-[11px] font-bold tracking-widest text-purple-300 uppercase">
                🎵 Audio Clip Playing
              </span>
            </div>
          )}

          {/* ── Video Inner Container ── */}
          <div
            className="relative overflow-hidden bg-black/90 rounded-[24px] flex items-center justify-center"
            style={{ minHeight: '240px', maxHeight: '75vh' }}
          >
            {/*
             * THE SINGLE PERSISTENT VIDEO ELEMENT.
             * src is set ONLY via videoRef (imperative) — React never touches it.
             * This prevents React reconciler from resetting src during re-renders.
             *
             * For audio-only files: video has width=0, height=0 naturally.
             * We force minWidth/minHeight so it doesn't collapse and audio still plays.
             * The audio-only visualizer overlay handles the visual display.
             *
             * opacity: invisible while loading (prevents flash of wrong frame),
             * visible once isReady or isAudioOnly.
             */}
            <video
              ref={videoRef}
              controls={false}
              playsInline
              preload="auto"
              disablePictureInPicture
              controlsList="nofullscreen noremoteplayback nodownload noplaybackrate"
              style={{
                display: 'block',
                width: isReady ? 'auto' : '100%',
                height: isReady ? 'auto' : '240px',
                minWidth:  isAudioOnly ? '100%' : undefined,
                minHeight: isAudioOnly ? '240px' : undefined,
                maxWidth: '100%',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: '24px',
                // Opacity: visible only when video is ready; audio-only is always 0
                // (the visualizer overlay handles the visual for audio-only)
                opacity: isReady ? 1 : 0,
                transition: 'opacity 0.35s ease',
                // GPU acceleration
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                willChange: 'transform',
                contain: 'layout paint size',
              }}
              className="movie-player pointer-events-none select-none"
            />

            {/* Status Badge */}
            <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-purple-500/20 border border-purple-500/50 px-3.5 py-1 text-xs font-bold text-purple-300 backdrop-blur-md shadow-lg shadow-purple-500/20 pointer-events-none z-30">
              <span className={`h-2 w-2 rounded-full ${isReady || isAudioOnly ? 'bg-green-400' : 'bg-purple-400 animate-pulse'}`} />
              {isAudioOnly ? 'AUDIO STAGE' : 'MOVIE VIDEO STAGE'}
            </div>
          </div>
        </motion.div>
      </div>
    );
  },
);

StageMediaPlayerComponent.displayName = 'StageMediaPlayer';

/**
 * Memoized to prevent re-renders from parent state changes (timer ticks, score).
 * Only re-renders when the QUESTION itself changes or autoplay flag flips.
 */
export const StageMediaPlayer = memo(
  StageMediaPlayerComponent,
  (prev, next) =>
    prev.questionId      === next.questionId      &&
    prev.videoUrl        === next.videoUrl        &&
    prev.mediaSrc        === next.mediaSrc        &&
    prev.autoPlayOnMount === next.autoPlayOnMount,
);
