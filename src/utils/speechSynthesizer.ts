/**
 * SpeechSynthesizer — Browser AI Host Voice Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Uses the Web Speech API (speechSynthesis) to provide a natural English voice host
 * for live auditorium events & stage game show announcements.
 */

class SpeechSynthesizerService {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private isEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();

      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
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

      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.voice) {
        utterance.voice = this.voice;
      }
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 1.0;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      // Fallback timeout in case speech engine stalls
      const timeout = setTimeout(() => resolve(), 4500);
      utterance.onend = () => {
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
   * AI Host Home Welcome
   */
  public speakHomeIntro() {
    this.speak('Welcome to the Freshers Challenge Arena.');
  }

  /**
   * AI Host Logo Challenge Start
   */
  public speakLogoIntro() {
    this.speak('Can you identify this logo?');
  }

  /**
   * AI Host Movie Challenge Full Sequence
   * 1. "Welcome to the Movie Challenge."
   * 2. "Watch the clip carefully and guess the movie."
   */
  public async speakMovieIntroSequence(): Promise<void> {
    await this.speakAsync('Welcome to the Movie Challenge.');
    await new Promise((res) => setTimeout(res, 300));
    await this.speakAsync('Watch the clip carefully and guess the movie.');
  }

  /**
   * AI Host Next Question
   */
  public speakNextQuestion(isFinal: boolean = false) {
    if (isFinal) {
      this.speak('This is the final question. Give it your best.');
    } else {
      this.speak("Let's move to the next challenge.");
    }
  }

  /**
   * AI Host Dramatic Answer Reveal
   */
  public speakReveal(answerText: string) {
    if (!this.isEnabled || !this.synth) return;

    this.synth.cancel();

    const part1 = new SpeechSynthesisUtterance('The correct answer is...');
    if (this.voice) part1.voice = this.voice;
    part1.rate = 0.92;
    part1.pitch = 1.0;

    part1.onend = () => {
      setTimeout(() => {
        if (!this.synth) return;
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
