/**
 * SpeechSynthesizer — Browser AI Host Voice Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Clean & reliable Web Speech API engine:
 * - Automatically speaks on page load without requiring any overlay clicks.
 * - Retains active utterance in class property to prevent Chrome Garbage Collection bug.
 * - Calls synth.resume() automatically.
 */

class SpeechSynthesizerService {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private isEnabled: boolean = true;
  private activeUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();

      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          this.loadVoices();
          if (this.synth) this.synth.resume();
        };
      }
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

      // Force resume synth for immediate automatic speech on load
      try {
        synth.resume();
        synth.cancel();
      } catch (e) {
        console.error(e);
      }

      this.loadVoices();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 1.0;

      if (this.voice) {
        utterance.voice = this.voice;
      }

      // Retain utterance reference to prevent Chrome Garbage Collection silencing utterance
      this.activeUtterance = utterance;

      let finished = false;
      const done = () => {
        if (!finished) {
          finished = true;
          this.activeUtterance = null;
          resolve();
        }
      };

      utterance.onend = done;
      utterance.onerror = done;

      const maxTimer = setTimeout(done, 4500);
      utterance.onend = () => {
        clearTimeout(maxTimer);
        done();
      };

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
