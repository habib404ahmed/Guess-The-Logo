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

const DEFAULT_FALLBACK_VIDEO = 'https://vjs.zencdn.net/v/oceans.mp4';

export const StageMediaPlayer = forwardRef<StageMediaPlayerRef, StageMediaPlayerProps>(
  ({ mediaSrc, videoUrl, autoPlayOnMount = false }, ref) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

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

      logVideoMetrics('initial_mount');

      return () => {
        handlers.forEach(({ evt, handler }) => {
          v.removeEventListener(evt, handler);
        });
      };
    }, [videoSrc]);

    // Unmuted Audio Playback by Default
    const safePlay = () => {
      if (!videoRef.current) return;
      videoRef.current.muted = false;
      
      const promise = videoRef.current.play();
      if (promise !== undefined) {
        promise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn('[Autoplay] Unmuted play blocked, retrying playback:', err);
            if (videoRef.current) {
              videoRef.current.muted = false;
              videoRef.current.play().catch(() => {});
            }
          });
      }
    };

    useImperativeHandle(ref, () => ({
      replay: () => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.muted = false;
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

    return (
      <div className="relative w-full max-w-2xl select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
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

          {/* ── CLEAN VIDEO SCREEN: NO PLAY, PAUSE, MUTE, OR TIMELINE CONTROLS BARS ── */}
          <div className="relative w-full overflow-hidden bg-black/90 rounded-3xl aspect-video flex items-center justify-center transform-gpu translate-z-0">
            <video
              ref={videoRef}
              src={videoSrc}
              controls={false}
              playsInline
              muted={false}
              autoPlay={true}
              preload="auto"
              disablePictureInPicture
              controlsList="nofullscreen noremoteplayback nodownload noplaybackrate"
              className="h-full w-full object-contain rounded-3xl movie-player transform-gpu translate-z-0 pointer-events-none select-none"
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

StageMediaPlayer.displayName = 'StageMediaPlayer';
