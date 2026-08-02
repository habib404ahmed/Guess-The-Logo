import { useRef, useEffect, useState, forwardRef, useImperativeHandle, memo } from 'react';
import { motion } from 'framer-motion';

interface StageMediaPlayerProps {
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

    // 2. Resolve video URL stable string
    const activeMediaUrl = videoUrl || mediaSrc || DEFAULT_FALLBACK_VIDEO;
    const [videoSrc, setVideoSrc] = useState(activeMediaUrl);

    useEffect(() => {
      setVideoSrc(activeMediaUrl);
    }, [activeMediaUrl]);

    // 4. Safe play helper (handles autoplay security policies)
    const safePlay = async () => {
      if (!videoRef.current) return;
      videoRef.current.muted = false;

      try {
        await videoRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('[Autoplay Policy] Unmuted play blocked, retrying:', err);
        if (videoRef.current) {
          videoRef.current.muted = false;
          await videoRef.current.play().catch(() => {});
          setIsPlaying(true);
        }
      }
    };

    // 5. Replay button: video.pause(); video.currentTime = 0; await video.play();
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

    // 4. Question changes setup: pause previous video, reset currentTime = 0, play once
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

          {/* ── SINGLE HARDWARE ACCELERATED HTML5 VIDEO ELEMENT (NO CSS EFFECTS ON VIDEO ITSELF) ── */}
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

// 1. & 9. Memoize video component so it ONLY re-renders when videoUrl or mediaSrc changes!
export const StageMediaPlayer = memo(
  StageMediaPlayerComponent,
  (prev, next) =>
    prev.videoUrl === next.videoUrl &&
    prev.mediaSrc === next.mediaSrc &&
    prev.autoPlayOnMount === next.autoPlayOnMount,
);

StageMediaPlayer.displayName = 'StageMediaPlayer';
