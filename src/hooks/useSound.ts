import { useCallback } from 'react';
import { audioManager } from '@/utils/audioManager';

export type SoundId =
  | 'click'
  | 'hover'
  | 'correct'
  | 'wrong'
  | 'reveal'
  | 'whoosh'
  | 'chime'
  | 'cinemaStart'
  | 'countdown'
  | 'victory'
  | 'tick';

/**
 * useSound Hook
 *
 * Centralized audio hook wrapping Web Audio API synthesizers from AudioManager.
 * High-energy game show audio engine modeled after TV shows (KBC, Shark Tank, AGT).
 */
export function useSound() {
  const play = useCallback((id: SoundId) => {
    switch (id) {
      case 'click':
        audioManager.playGameShowTransition();
        break;
      case 'reveal':
      case 'correct':
      case 'chime':
        audioManager.playRevealSequence();
        break;
      case 'whoosh':
        audioManager.playCinematicWhoosh();
        break;
      case 'cinemaStart':
        audioManager.playCinematicIntro();
        break;
      case 'victory':
        audioManager.playVictorySting();
        break;
      default:
        audioManager.playCinematicWhoosh();
        break;
    }
  }, []);

  const playRevealSequence = useCallback((onImpactCallback?: () => void) => {
    audioManager.playRevealSequence(onImpactCallback);
  }, []);

  const playNextSequence = useCallback(() => {
    audioManager.playGameShowTransition();
  }, []);

  const playCinemaStart = useCallback(() => {
    audioManager.playCinematicIntro();
  }, []);

  const toggleMute = useCallback(() => {
    return audioManager.toggleMute();
  }, []);

  return {
    play,
    playRevealSequence,
    playNextSequence,
    playCinemaStart,
    toggleMute,
    isMuted: audioManager.getIsMuted(),
  };
}
