import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';

interface StageMediaPlayerProps {
  mediaSrc: string;
  videoUrl?: string;
  fileName?: string;
  movieTitle?: string;
  genre?: string;
  speaker?: string;
  lines?: string[];
  linesShown?: number;
  autoPlayOnMount?: boolean;
}

export interface StageMediaPlayerRef {
  replay: () => void;
  pause: () => void;
  play: () => void;
}

const DEFAULT_FALLBACK_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

export const StageMediaPlayer = forwardRef<StageMediaPlayerRef, StageMediaPlayerProps>(
  ({ mediaSrc, videoUrl, autoPlayOnMount = false }, ref) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Always resolve a valid video URL (never fall back to a quote card!)
    const activeMediaUrl = videoUrl || mediaSrc || DEFAULT_FALLBACK_VIDEO;

    useImperativeHandle(ref, () => ({
      replay: () => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {});
          setIsPlaying(true);
        }
      },
      pause: () => {
        if (videoRef.current) videoRef.current.pause();
        setIsPlaying(false);
      },
      play: () => {
        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
          setIsPlaying(true);
        }
      },
    }));

    // Auto-play ONLY if autoPlayOnMount is explicitly true
    useEffect(() => {
      if (!autoPlayOnMount) {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
        setIsPlaying(false);
        return;
      }

      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => setIsPlaying(false));
      }
      return () => {
        if (videoRef.current) videoRef.current.pause();
      };
    }, [activeMediaUrl, autoPlayOnMount]);

    return (
      <div className="relative w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
          transition={{
            duration: 0.4,
            y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="relative flex flex-col overflow-hidden rounded-3xl backdrop-blur-2xl group"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
            border: '2px solid rgba(168,85,247,0.4)',
            boxShadow:
              '0 24px 70px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.25), 0 0 50px rgba(168,85,247,0.25)',
            minHeight: '320px',
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

          {/* ── ALWAYS RENDER HTML5 VIDEO PLAYER (NO CARDS / NO PLACEHOLDERS) ── */}
          <div className="relative w-full overflow-hidden bg-black/80 rounded-3xl aspect-video flex items-center justify-center">
            <video
              ref={videoRef}
              src={activeMediaUrl}
              controls
              playsInline
              preload="metadata"
              autoPlay={false}
              controlsList="nodownload noplaybackrate noremoteplayback"
              disablePictureInPicture
              className="h-full w-full object-contain rounded-3xl movie-player"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />

            {/* Status Indicator */}
            {isPlaying && (
              <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-purple-500/20 border border-purple-500/50 px-3.5 py-1 text-xs font-bold text-purple-300 backdrop-blur-md shadow-lg shadow-purple-500/20 pointer-events-none">
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

StageMediaPlayer.displayName = 'StageMediaPlayer';
