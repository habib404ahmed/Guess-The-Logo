/**
 * SpeechSynthesizer — Browser AI Host Voice Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Uses the Web Speech API (speechSynthesis) to provide a natural English voice host.
 * Fixed for modern Chrome/Edge autoplay policy & late voice loading.
 */

class SpeechSynthesizerService {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private isEnabled: boolean = true;
  private hasUserInteracted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();

      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }

      // Track user interaction to unlock browser Web Speech API & Web Audio API
      const unlockAudio = () => {
        this.hasUserInteracted = true;
        if (this.synth) {
          this.synth.resume();
        }
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };

      window.addEventListener('click', unlockAudio, { once: true });
      window.addEventListener('touchstart', unlockAudio, { once: true });
      window.addEventListener('keydown', unlockAudio, { once: true });
    }
  }

  public loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();

    const preferredVoices = voices.filter(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Google') ||
          v.name.includes('Natural') ||
          v.name.includes('Samantha') ||
          v.name.includes('Daniel') ||
          v.name.includes('Arthur') ||
          v.name.includes('Microsoft')),
    );

    this.voice =
      preferredVoices[0] || voices.find((v) => v.lang.startsWith('en')) || null;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled && this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * Promise-based speak that resolves strictly when utterance finishes
   */
  public speakAsync(text: string, rate: number = 0.95, pitch: number = 1.0): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isEnabled || !this.synth) {
        resolve();
        return;
      }

      // Ensure voices are loaded
      if (!this.voice) {
        this.loadVoices();
      }

      // Resume synth if paused by browser
      if (this.synth.paused) {
        this.synth.resume();
      }

      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.voice) {
        utterance.voice = this.voice;
      }
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 1.0;

      const timeout = setTimeout(() => resolve(), 4500);
      utterance.onend = () => {
        clearTimeout(timeout);
        resolve();
      };
      utterance.onerror = () => {
        clearTimeout(timeout);
        resolve();
      };

      this.synth.speak(utterance);
    });
  }

  public speak(text: string, rate: number = 0.95, pitch: number = 1.0) {
    this.speakAsync(text, rate, pitch);
  }

  /**
   * ✔ Home Page Welcome
   */
  public speakHomeIntro() {
    this.speak('Welcome to the Freshers Challenge Arena.');
  }

  /**
   * ✔ Logo Challenge Start
   */
  public speakLogoIntro() {
    this.speak('Can you identify this logo?');
  }

  /**
   * ✔ Movie Challenge Intro
   */
  public async speakMovieIntroSequence(): Promise<void> {
    await this.speakAsync('Watch the clip carefully and guess the movie.');
  }

  /**
   * ✔ Final Question Announcement
   */
  public speakFinalQuestion() {
    this.speak('This is the final question.');
  }

  /**
   * ✔ Dramatic Answer Reveal
   */
  public speakReveal(answerText: string) {
    if (!this.isEnabled || !this.synth) return;

    if (this.synth.paused) {
      this.synth.resume();
    }

    this.synth.cancel();

    const part1 = new SpeechSynthesisUtterance('The correct answer is...');
    if (this.voice) part1.voice = this.voice;
    part1.rate = 0.92;
    part1.pitch = 1.0;

    part1.onend = () => {
      setTimeout(() => {
        if (!this.synth) return;
        if (this.synth.paused) this.synth.resume();
        const part2 = new SpeechSynthesisUtterance(answerText);
        if (this.voice) part2.voice = this.voice;
        part2.rate = 0.95;
        part2.pitch = 1.05;
        this.synth.speak(part2);
      }, 700);
    };

    this.synth.speak(part1);
  }
}

export const speechSynthesizer = new SpeechSynthesizerService();
