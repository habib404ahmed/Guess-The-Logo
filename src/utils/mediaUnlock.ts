declare global {
  interface Window {
    __MEDIA_UNLOCKED__?: boolean;
  }
}

export async function unlockMedia(videoElement?: HTMLVideoElement | null): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const video = videoElement || (document.querySelector('video') as HTMLVideoElement);
    if (video) {
      video.muted = true;
      await video.play();
      video.pause();
      video.currentTime = 0;
      video.muted = false;
    }

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
    }

    window.__MEDIA_UNLOCKED__ = true;
    console.log("Media unlocked");
  } catch (e) {
    console.error("Media unlock error:", e);
  }
}

export function isMediaUnlocked(): boolean {
  return typeof window !== 'undefined' && Boolean(window.__MEDIA_UNLOCKED__);
}
