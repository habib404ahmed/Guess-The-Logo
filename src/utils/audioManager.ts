/**
 * AudioManager — Game Show Audio Synthesizer Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Modeled after high-energy TV game shows (KBC, Shark Tank, AGT, Family Feud).
 * Zero latency, 48kHz Web Audio API synthesis delivering powerful cinematic whooshes,
 * sub-bass boom impacts, victory brass stings, and energetic transitions.
 */

class AudioManagerService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  private initContext(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;

      if (AudioCtx) {
        this.ctx = new AudioCtx({ sampleRate: 48000 });
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.55; // 55% auditorium level
        this.masterGain.connect(this.ctx.destination);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        muted ? 0 : 0.55,
        this.ctx.currentTime,
      );
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Futuristic High-Tech Hover Tick
   */
  public playHover(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(2400, now + 0.025);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  /**
   * Tactile Mechanical Click Sound
   */
  public playClick(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.045);
  }

  /**
   * 1. Powerful Cinematic Whoosh
   * High-energy filtered noise sweep + pitch drop.
   */
  public playCinematicWhoosh(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const duration = 0.22; // 220ms

    // Noise buffer
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Swept bandpass filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2800, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + duration);
    filter.Q.value = 2.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.45, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
  }

  /**
   * 2. Sub-Bass Boom Impact
   * Deep punchy low-end thud + initial transient strike.
   */
  public playBoomImpact(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const duration = 0.45;

    // Sub-bass sine drop (160Hz -> 30Hz)
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();

    sub.type = 'sine';
    sub.frequency.setValueAtTime(160, now);
    sub.frequency.exponentialRampToValueAtTime(32, now + duration);

    subGain.gain.setValueAtTime(0.65, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    sub.connect(subGain);
    subGain.connect(this.masterGain);
    sub.start(now);
    sub.stop(now + duration);

    // Initial punchy transient click
    const punch = ctx.createOscillator();
    const punchGain = ctx.createGain();

    punch.type = 'triangle';
    punch.frequency.setValueAtTime(300, now);
    punch.frequency.exponentialRampToValueAtTime(50, now + 0.03);

    punchGain.gain.setValueAtTime(0.5, now);
    punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    punch.connect(punchGain);
    punchGain.connect(this.masterGain);
    punch.start(now);
    punch.stop(now + 0.035);
  }

  /**
   * 3. High-Energy Victory Sting & Applause
   * Game show fanfare G Major chord (G5, B5, D6, G6) + soft crowd applause burst.
   */
  public playVictorySting(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const chord = [783.99, 987.77, 1174.66, 1567.98]; // G Major

    // Fanfare chord
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.03);

      const start = now + idx * 0.03;
      gain.gain.setValueAtTime(0.01, start);
      gain.gain.linearRampToValueAtTime(0.28, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.85);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(start);
      osc.stop(start + 0.9);
    });

    // Short Applause Shimmer Burst
    const appDuration = 0.6;
    const bufferSize = ctx.sampleRate * appDuration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const applause = ctx.createBufferSource();
    applause.buffer = buffer;

    const appFilter = ctx.createBiquadFilter();
    appFilter.type = 'bandpass';
    appFilter.frequency.setValueAtTime(3200, now + 0.1);
    appFilter.Q.value = 1.0;

    const appGain = ctx.createGain();
    appGain.gain.setValueAtTime(0.01, now + 0.1);
    appGain.gain.linearRampToValueAtTime(0.18, now + 0.25);
    appGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1 + appDuration);

    applause.connect(appFilter);
    appFilter.connect(appGain);
    appGain.connect(this.masterGain);

    applause.start(now + 0.1);
  }

  /**
   * 4. Fast TV Game Show Transition (Next Round)
   */
  public playGameShowTransition(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.15);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.16);

    this.playCinematicWhoosh();
  }

  /**
   * 5. Cinematic Intro (Movie Dialogue Start)
   */
  public playCinematicIntro(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.3);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.linearRampToValueAtTime(1200, now + 0.3);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  /**
   * 🎯 Full Game Show Reveal Sequence:
   *  Click -> Whoosh -> Boom Impact -> Victory Fanfare & Applause -> Answer Appears
   */
  public playRevealSequence(onImpactCallback?: () => void): void {
    this.playClick();
    this.playCinematicWhoosh();

    setTimeout(() => {
      this.playBoomImpact();
      if (onImpactCallback) onImpactCallback();
    }, 140);

    setTimeout(() => {
      this.playVictorySting();
    }, 240);
  }
}

export const audioManager = new AudioManagerService();
