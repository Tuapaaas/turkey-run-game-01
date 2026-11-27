// audio.js — all sound is synthesized with WebAudio: no audio files,
// no network. A tiny step sequencer plays a banjo-ish farm tune while
// the turkey runs, and short blips mark jumps, corn, hits and escapes.

const NOTE_FREQ = {
  C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.0, A4: 440.0,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0,
};

// A cheerful 16-step loop in C major pentatonic, banjo-pluck voice.
const TUNE = [
  'E4', 'G4', 'A4', 'G4', 'E4', 'C4', 'D4', 'E4',
  'G4', 'A4', 'G5', 'A4', 'G4', 'E4', 'D4', 'C4',
];

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicTimer = null;
    this.step = 0;
  }

  /** Create the AudioContext on a user gesture (browsers require one). */
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
    } catch {
      this.ctx = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  /** One short oscillator blip: freq slides from `from` to `to`. */
  blip(from, to, seconds, type, volume) {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(from, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), now + seconds);
    gain.gain.setValueAtTime(volume || 0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + seconds + 0.02);
  }

  jump() { this.blip(300, 620, 0.14, 'square', 0.06); }
  corn() { this.blip(880, 1320, 0.1, 'sine', 0.09); }
  thud() { this.blip(160, 55, 0.22, 'sawtooth', 0.12); }
  hide() { this.blip(500, 240, 0.18, 'triangle', 0.07); }
  cluck() { this.blip(420, 300, 0.07, 'square', 0.05); }
  caught() {
    this.blip(392, 98, 0.5, 'sawtooth', 0.12);
    setTimeout(() => this.blip(311, 82, 0.5, 'sawtooth', 0.1), 140);
  }
  escaped() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => setTimeout(() => this.blip(f, f, 0.22, 'triangle', 0.1), i * 130));
  }

  /** Start the farm tune loop; call once when play begins. */
  startMusic() {
    if (!this.ctx || this.musicTimer) return;
    this.musicTimer = setInterval(() => {
      if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
      const note = TUNE[this.step % TUNE.length];
      this.step += 1;
      this.blip(NOTE_FREQ[note], NOTE_FREQ[note], 0.16, 'triangle', 0.035);
    }, 190);
  }

  stopMusic() {
    if (this.musicTimer) clearInterval(this.musicTimer);
    this.musicTimer = null;
  }
}
