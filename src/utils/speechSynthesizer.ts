/**
 * SpeechSynthesizer — Browser AI Host Voice Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Fixed for Chrome on Windows SpeechSynthesis bugs:
 * 1. Garbage collection bug (stores utterance in class property)
 * 2. Autoplay & pause bug (periodic resume interval)
 * 3. Asynchronous voice loading (onvoiceschanged)
 */

class SpeechSynthesizerService {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private isEnabled: boolean = true;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private resumeTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();

      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }

      // Unlock speech synthesis on first user interaction
      const unlock = () => {
        if (this.synth) {
          this.synth.resume();
        }
      };
      window.addEventListener('click', unlock);
      window.addEventListener('touchstart', unlock);
      window.addEventListener('keydown', unlock);
    }
  }

  public loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return;

    const preferred = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Google') ||
          v.name.includes('Natural') ||
          v.name.includes('Samantha') ||
          v.name.includes('Daniel') ||
          v.name.includes('Microsoft')),
    );

    this.voice =
      preferred || voices.find((v) => v.lang.startsWith('en')) || voices[0] || null;
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
      if (!this.isEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      const synth = window.speechSynthesis;

      // Clear previous utterance & resume timers
      if (this.resumeTimer) clearInterval(this.resumeTimer);
      synth.resume();
      synth.cancel();

      // Ensure voice is populated
      this.loadVoices();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 1.0;

      if (this.voice) {
        utterance.voice = this.voice;
      }

      // Store reference to prevent Chrome Garbage Collection silencing utterance
      this.activeUtterance = utterance;

      let hasFinished = false;
      const cleanup = () => {
        if (this.resumeTimer) {
          clearInterval(this.resumeTimer);
          this.resumeTimer = null;
        }
        this.activeUtterance = null;
        if (!hasFinished) {
          hasFinished = true;
          resolve();
        }
      };

      utterance.onend = cleanup;
      utterance.onerror = cleanup;

      // Chrome fallback timer in case speech engine stalls
      const maxTimeout = setTimeout(cleanup, 5000);

      utterance.onend = () => {
        clearTimeout(maxTimeout);
        cleanup();
      };

      // Workaround for Chrome bug where speech synthesis randomly pauses
      this.resumeTimer = setInterval(() => {
        if (!synth.speaking) {
          cleanup();
        } else {
          synth.resume();
        }
      }, 250);

      synth.speak(utterance);
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
    this.speakAsync('The correct answer is...').then(() => {
      setTimeout(() => {
        this.speak(answerText);
      }, 600);
    });
  }
}

export const speechSynthesizer = new SpeechSynthesizerService();
