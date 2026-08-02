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
    const [isMuted, setIsMuted] = useState(false);

    // Always resolve video source using dialogueSrc || videoUrl
    const activeMediaUrl = videoUrl || mediaSrc || DEFAULT_FALLBACK_VIDEO;
    const [videoSrc, setVideoSrc] = useState(activeMediaUrl);

    useEffect(() => {
      setVideoSrc(activeMediaUrl);
    }, [activeMediaUrl]);

    // Attach complete suite of requested HTML5 video event listeners & print video state metrics
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

      // Initial state log
      logVideoMetrics('initial_mount');

      return () => {
        handlers.forEach(({ evt, handler }) => {
          v.removeEventListener(evt, handler);
        });
      };
    }, [videoSrc]);

    // Robust play function supporting browser autoplay security policies
    const safePlay = () => {
      if (!videoRef.current) return;
      
      const promise = videoRef.current.play();
      if (promise !== undefined) {
        promise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn('[Autoplay Policy] Unmuted play blocked, falling back to muted play:', err);
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current
                .play()
                .then(() => setIsPlaying(true))
                .catch((e) => console.error('[Autoplay Error] Muted play also failed:', e));
            }
          });
      }
    };

    useImperativeHandle(ref, () => ({
      replay: () => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.muted = false;
          setIsMuted(false);
          safePlay();
        }
      },
      pause: () => {
        if (videoRef.current) videoRef.current.pause();
        setIsPlaying(false);
      },
      play: () => {
        safePlay();
      },
    }));

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
        if (videoRef.current) videoRef.current.pause();
      };
    }, [videoSrc, autoPlayOnMount]);

    const handleVideoClick = () => {
      if (!videoRef.current) return;
      if (videoRef.current.paused) {
        videoRef.current.muted = false;
        setIsMuted(false);
        safePlay();
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };

    return (
      <div className="relative w-full max-w-2xl select-none">
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

          {/* ── HTML5 VIDEO PLAYER WITH ALL METRIC LISTENERS & SAFE AUTOPLAY ── */}
          <div
            className="relative w-full overflow-hidden bg-black/90 rounded-3xl aspect-video flex items-center justify-center cursor-pointer"
            onClick={handleVideoClick}
          >
            <video
              ref={videoRef}
              src={videoSrc}
              controls
              playsInline
              muted={isMuted}
              preload="auto"
              controlsList="nodownload noplaybackrate noremoteplayback"
              disablePictureInPicture
              className="h-full w-full object-contain rounded-3xl movie-player"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              onError={() => {
                console.warn('[Video Player Error] Failed loading media source:', videoSrc);
                if (videoSrc !== DEFAULT_FALLBACK_VIDEO) {
                  setVideoSrc(DEFAULT_FALLBACK_VIDEO);
                }
              }}
            />

            {/* Play Overlay Button if Paused */}
            {!isPlaying && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all hover:bg-black/20">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-600/80 border border-purple-400/60 text-white text-2xl shadow-xl shadow-purple-500/40 hover:scale-110 transition-transform">
                  ▶
                </div>
                <span className="mt-3 text-xs font-black text-purple-200 tracking-widest uppercase">
                  Click to Play Video Clip
                </span>
              </div>
            )}

            {/* Muted Warning Badge */}
            {isMuted && isPlaying && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (videoRef.current) {
                    videoRef.current.muted = false;
                    setIsMuted(false);
                  }
                }}
                className="absolute bottom-16 right-4 flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-500/50 px-4 py-1.5 text-xs font-extrabold text-amber-300 backdrop-blur-md shadow-lg shadow-amber-500/20 z-30 animate-bounce"
              >
                🔇 MUTED BY BROWSER — CLICK TO UNMUTE AUDIO
              </button>
            )}

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
