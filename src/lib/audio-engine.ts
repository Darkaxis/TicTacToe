"use client";

// Procedural Web Audio Synthesizer for Tactical Grid UI
// Zero external asset dependencies; crisp industrial acoustic feedback.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public playHoverTick() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(3200, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.014);

    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.016);
  }

  public playLatchClick() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(1100, now);
    osc.frequency.setValueAtTime(2400, now + 0.012);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.038);
  }

  public playDeployX() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(135, now);
    subOsc.frequency.exponentialRampToValueAtTime(38, now + 0.14);
    subGain.gain.setValueAtTime(0.22, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.16);

    const hiOsc = ctx.createOscillator();
    const hiGain = ctx.createGain();
    hiOsc.type = "triangle";
    hiOsc.frequency.setValueAtTime(1480, now + 0.015);
    hiOsc.frequency.setValueAtTime(2220, now + 0.055);
    hiGain.gain.setValueAtTime(0.08, now + 0.015);
    hiGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);
    hiOsc.connect(hiGain);
    hiGain.connect(ctx.destination);
    hiOsc.start(now + 0.015);
    hiOsc.stop(now + 0.18);
  }

  public playDeployO() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = "sawtooth";
    bassOsc.frequency.setValueAtTime(110, now);
    bassOsc.frequency.exponentialRampToValueAtTime(42, now + 0.16);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(420, now);

    bassGain.gain.setValueAtTime(0.14, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

    bassOsc.connect(filter);
    filter.connect(bassGain);
    bassGain.connect(ctx.destination);
    bassOsc.start(now);
    bassOsc.stop(now + 0.18);

    const pingOsc = ctx.createOscillator();
    const pingGain = ctx.createGain();
    pingOsc.type = "sine";
    pingOsc.frequency.setValueAtTime(980, now + 0.02);
    pingOsc.frequency.setValueAtTime(650, now + 0.065);
    pingGain.gain.setValueAtTime(0.08, now + 0.02);
    pingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    pingOsc.connect(pingGain);
    pingGain.connect(ctx.destination);
    pingOsc.start(now + 0.02);
    pingOsc.stop(now + 0.19);
  }

  public playMatchEnd(outcome: "X" | "O" | "DRAW") {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes =
      outcome === "X"
        ? [587.33, 880.0, 1174.66, 1760.0]
        : outcome === "O"
        ? [440.0, 415.3, 329.63, 220.0]
        : [659.25, 587.33, 659.25];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.075;

      osc.type = outcome === "O" ? "sawtooth" : "triangle";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.09, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.36);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.38);
    });
  }
}

export const soundEngine = new SoundEngine();

