import { useRef, useEffect, useState, forwardRef, useImperativeHandle, memo } from 'react';
import { motion } from 'framer-motion';

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

const DEFAULT_FALLBACK_VIDEO = 'https://vjs.zencdn.net/v/oceans.mp4';

const StageMediaPlayerComponent = forwardRef<StageMediaPlayerRef, StageMediaPlayerProps>(
  ({ mediaSrc, videoUrl, autoPlayOnMount = false }, ref) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Resolve video URL
    const activeMediaUrl = videoUrl || mediaSrc || DEFAULT_FALLBACK_VIDEO;
    const [videoSrc, setVideoSrc] = useState(activeMediaUrl);

    useEffect(() => {
      setVideoSrc(activeMediaUrl);
    }, [activeMediaUrl]);

    // Attach complete suite of requested HTML5 video event listeners
    useEffect(() => {
      const v = videoRef.current;
      if (!v) return;

      const logVideoMetrics = (eventName: string) => {
        console.log(`[Video Event: ${eventName}]`);
        console.log("video.currentSrc =", v.currentSrc);
        console.log("video.readyState =", v.readyState);
        console.log("video.networkState =", v.networkState);
        console.log("video.videoWidth =", v.videoWidth);
        console.log("video.videoHeight =", v.videoHeight);
        console.log("video.error =", v.error);
      };

      const events = [
        'loadedmetadata',
        'loadeddata',
        'canplay',
        'playing',
        'error',
        'stalled',
        'waiting',
        'emptied',
      ];

      const handlers = events.map((evt) => {
        const handler = () => logVideoMetrics(evt);
        v.addEventListener(evt, handler);
        return { evt, handler };
      });

      logVideoMetrics('initial_mount');

      return () => {
        handlers.forEach(({ evt, handler }) => {
          v.removeEventListener(evt, handler);
        });
      };
    }, [videoSrc]);

    // 4. Wait for readyState >= 3 (canplay event) before calling play()
    const safePlay = async () => {
      const v = videoRef.current;
      if (!v) return;

      // Log values before playback as requested
      console.log("video.readyState =", v.readyState);
      console.log("video.networkState =", v.networkState);
      console.log("video.currentSrc =", v.currentSrc);
      console.log("video.videoWidth =", v.videoWidth);
      console.log("video.videoHeight =", v.videoHeight);
      console.log("video.paused =", v.paused);

      // Wait until video canplay (readyState >= 3)
      await new Promise<void>((resolve) => {
        if (v.readyState >= 3) {
          resolve();
        } else {
          const handler = () => resolve();
          v.addEventListener('canplay', handler, { once: true });
        }
      });

      v.muted = false;

      try {
        await v.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('[Autoplay Policy] Unmuted play blocked, retrying:', err);
        if (v) {
          v.muted = false;
          await v.play().catch(() => {});
          setIsPlaying(true);
        }
      }
    };

    // 2. & 5. Replay button: video.pause(); video.currentTime = 0; await video.play();
    useImperativeHandle(ref, () => ({
      replay: async () => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
          await safePlay();
        }
      },
      pause: () => {
        if (videoRef.current) {
          videoRef.current.pause();
        }
        setIsPlaying(false);
      },
      play: async () => {
        await safePlay();
      },
    }));

    // 1. & 4. Question change setup: stop previous video, reset currentTime = 0, play once when countdown finishes
    useEffect(() => {
      if (!autoPlayOnMount) {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
        setIsPlaying(false);
        return;
      }

      safePlay();

      return () => {
        if (videoRef.current) {
          videoRef.current.pause();
        }
      };
    }, [videoSrc, autoPlayOnMount]);

    return (
      <div
        className="relative flex flex-col items-center justify-center m-auto select-none"
        style={{
          width: 'fit-content',
          height: 'fit-content',
          maxWidth: '100%',
          maxHeight: '75vh',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
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

          {/* ── 8. NO EXPENSIVE CSS ON VIDEO (NO BLUR, NO FILTER, NO SCALE TO PREVENT STUTTER) ── */}
          <div
            className="relative overflow-hidden bg-black/90 rounded-[24px] flex items-center justify-center transform-gpu translate-z-0"
            style={{
              width: 'fit-content',
              height: 'fit-content',
              maxWidth: '100%',
              maxHeight: '75vh',
            }}
          >
            <video
              ref={videoRef}
              src={videoSrc}
              controls={false}
              playsInline
              autoPlay={false}
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
                willChange: 'transform',
                transform: 'translateZ(0)',
                borderRadius: '24px',
              }}
              className="movie-player pointer-events-none select-none"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              onError={() => {
                console.warn('[Video Error] Switching to fallback stream:', videoSrc);
                if (videoSrc !== DEFAULT_FALLBACK_VIDEO) {
                  setVideoSrc(DEFAULT_FALLBACK_VIDEO);
                }
              }}
            />

            {/* Status Indicator */}
            {isPlaying && (
              <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-purple-500/20 border border-purple-500/50 px-3.5 py-1 text-xs font-bold text-purple-300 backdrop-blur-md shadow-lg shadow-purple-500/20 pointer-events-none z-30">
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-ping" />
                PLAYING VIDEO CLIP
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  },
);

// 7. Memoize video component so it re-renders ONLY when questionId, videoUrl, or mediaSrc changes
export const StageMediaPlayer = memo(
  StageMediaPlayerComponent,
  (prev, next) =>
    prev.questionId === next.questionId &&
    prev.videoUrl === next.videoUrl &&
    prev.mediaSrc === next.mediaSrc &&
    prev.autoPlayOnMount === next.autoPlayOnMount,
);

StageMediaPlayer.displayName = 'StageMediaPlayer';
