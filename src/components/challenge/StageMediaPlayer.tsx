import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

function FilmIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 8h20M8 3v5M16 3v5M8 17v4M16 17v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export const StageMediaPlayer = forwardRef<StageMediaPlayerRef, StageMediaPlayerProps>(
  ({ mediaSrc, videoUrl, fileName, speaker, lines = [], linesShown = 0, autoPlayOnMount = false }, ref) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Exact video source shared between Video Player and Replay button
    const activeMediaUrl = videoUrl || mediaSrc || '';

    // Detect if media is a video file, video Data URL, HTTP video URL, or video Blob URL
    const isVideo =
      Boolean(activeMediaUrl) &&
      (
        activeMediaUrl.startsWith('blob:') ||
        activeMediaUrl.startsWith('data:video/') ||
        activeMediaUrl.startsWith('http://') ||
        activeMediaUrl.startsWith('https://') ||
        /\.(mp4|mov|webm|mkv|avi|m4v)$/i.test(activeMediaUrl) ||
        (fileName && /\.(mp4|mov|webm|mkv|avi|m4v)$/i.test(fileName)) ||
        !activeMediaUrl.startsWith('data:audio/')
      );

    useImperativeHandle(ref, () => ({
      replay: () => {
        if (isVideo && videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {});
          setIsPlaying(true);
        } else if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
          setIsPlaying(true);
        }
      },
      pause: () => {
        if (videoRef.current) videoRef.current.pause();
        if (audioRef.current) audioRef.current.pause();
        setIsPlaying(false);
      },
      play: () => {
        if (isVideo && videoRef.current) {
          videoRef.current.play().catch(() => {});
          setIsPlaying(true);
        } else if (audioRef.current) {
          audioRef.current.play().catch(() => {});
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
      if (isVideo && videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => setIsPlaying(false));
      } else if (activeMediaUrl) {
        if (audioRef.current) audioRef.current.pause();
        const audio = new Audio(activeMediaUrl);
        audioRef.current = audio;
        audio.play().catch(() => setIsPlaying(false));
        audio.onended = () => setIsPlaying(false);
      }
      return () => {
        if (videoRef.current) videoRef.current.pause();
        if (audioRef.current) audioRef.current.pause();
      };
    }, [activeMediaUrl, isVideo, autoPlayOnMount]);

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
            minHeight: isVideo && activeMediaUrl ? '320px' : '220px',
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

          {/* ── VIDEO PLAYER MODE ── */}
          {isVideo && activeMediaUrl ? (
            <div className="relative w-full overflow-hidden bg-black/70 rounded-3xl aspect-video flex items-center justify-center">
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
          ) : (
            /* ── AUDIO DIALOGUE CARD / PLACEHOLDER MODE (Only shown if no video exists) ── */
            <div className="relative p-8 flex flex-col gap-4">
              {/* Decorative Quote Mark */}
              <span
                className="absolute -top-3 left-6 select-none font-black leading-none"
                style={{
                  fontSize: '6.5rem',
                  color: 'rgba(168,85,247,0.12)',
                  fontFamily: 'Georgia, serif',
                }}
                aria-hidden
              >
                "
              </span>

              {/* Speaker Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: 'rgba(168,85,247,0.22)',
                      color: '#c084fc',
                      border: '1px solid rgba(168,85,247,0.4)',
                    }}
                  >
                    <FilmIcon />
                  </div>
                  {speaker && (
                    <span className="text-label font-bold text-[#c084fc]">
                      {speaker}
                    </span>
                  )}
                </div>

                {/* Animated Equalizer Wave */}
                {isPlaying && (
                  <div className="flex items-center gap-1">
                    {[12, 20, 16, 24, 14].map((h, i) => (
                      <motion.span
                        key={i}
                        animate={{ height: [8, h, 8] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                        className="w-1 rounded-full bg-purple-400"
                        style={{ height: `${h}px` }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Dialogue Lines — Typewriter Stagger */}
              <div className="relative z-10 flex flex-col gap-2">
                {lines.map((line, i) => (
                  <AnimatePresence key={`line-${i}`}>
                    {linesShown > i && (
                      <motion.p
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
                        className="font-medium italic leading-relaxed text-[#f0f4ff]"
                        style={{
                          fontFamily: 'Georgia, serif',
                          fontSize: 'clamp(1.15rem, 2.5vw, 1.4rem)',
                        }}
                      >
                        {line}
                      </motion.p>
                    )}
                  </AnimatePresence>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  },
);

StageMediaPlayer.displayName = 'StageMediaPlayer';
