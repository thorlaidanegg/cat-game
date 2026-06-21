import type { AreaId } from "../store/useGame";

/**
 * Procedural ambient music.
 *
 * Rather than shipping (and licensing) audio files, we synthesise gentle,
 * royalty-free-by-construction pads + a soft arpeggio with the Web Audio API.
 * Each area maps to a musical "mood" (scale + tempo + timbre), and we crossfade
 * the master gain when the mood changes so transitions feel smooth.
 *
 * To use real tracks later: replace `playMood` with HTMLAudioElement crossfades
 * and keep the same public surface (init / setMood / setMuted / dispose).
 */

type Mood = {
  // semitone offsets from the root, defining the scale we noodle over
  scale: number[];
  root: number; // base frequency (Hz)
  tempo: number; // seconds per step
  type: OscillatorType;
  detune: number;
};

const MOODS: Record<AreaId, Mood> = {
  meadow: { scale: [0, 2, 4, 7, 9], root: 261.63, tempo: 0.5, type: "triangle", detune: 4 },
  lake: { scale: [0, 3, 5, 7, 10], root: 196.0, tempo: 0.65, type: "sine", detune: 6 },
  picnic: { scale: [0, 2, 4, 5, 7, 9], root: 293.66, tempo: 0.45, type: "triangle", detune: 3 },
  sakura: { scale: [0, 2, 4, 7, 9, 11], root: 329.63, tempo: 0.6, type: "sine", detune: 2 },
  stargaze: { scale: [0, 3, 7, 10, 12], root: 174.61, tempo: 0.8, type: "sine", detune: 8 },
  race: { scale: [0, 2, 4, 7, 9], root: 329.63, tempo: 0.28, type: "square", detune: 4 },
  heart: { scale: [0, 4, 7, 11, 12], root: 220.0, tempo: 0.9, type: "sine", detune: 5 },
};

function semitoneToFreq(root: number, semis: number) {
  return root * Math.pow(2, semis / 12);
}

export class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private pad: GainNode | null = null;
  private timer: number | null = null;
  private mood: Mood = MOODS.meadow;
  private step = 0;
  private muted = false;

  /** Must be called from a user gesture (e.g. clicking "Start"). */
  init() {
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.22;
    this.master.connect(this.ctx.destination);

    // a soft sustained pad underneath everything
    this.pad = this.ctx.createGain();
    this.pad.gain.value = 0.0;
    this.pad.connect(this.master);
    this.startPad();
    this.scheduleLoop();
  }

  private startPad() {
    if (!this.ctx || !this.pad) return;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc.type = "sine";
    osc2.type = "sine";
    osc.frequency.value = this.mood.root / 2;
    osc2.frequency.value = semitoneToFreq(this.mood.root / 2, 7);
    osc2.detune.value = this.mood.detune;
    osc.connect(this.pad);
    osc2.connect(this.pad);
    osc.start();
    osc2.start();
    this.pad.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 3);
  }

  private scheduleLoop() {
    const tick = () => {
      this.playStep();
      this.timer = window.setTimeout(tick, this.mood.tempo * 1000);
    };
    tick();
  }

  private playStep() {
    if (!this.ctx || !this.master) return;
    // gentle arpeggio with a touch of randomness so it never feels mechanical
    const useNote = Math.random() > 0.25;
    if (!useNote) {
      this.step++;
      return;
    }
    const scale = this.mood.scale;
    const octave = Math.random() > 0.7 ? 12 : 0;
    const semis = scale[this.step % scale.length] + octave;
    const freq = semitoneToFreq(this.mood.root, semis);

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = this.mood.type;
    osc.frequency.value = freq;
    osc.detune.value = (Math.random() - 0.5) * this.mood.detune * 2;

    const now = this.ctx.currentTime;
    const peak = 0.16;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(peak, now + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

    osc.connect(g);
    g.connect(this.master);
    osc.start(now);
    osc.stop(now + 1.5);
    this.step++;
  }

  setMood(area: AreaId) {
    const next = MOODS[area];
    if (next === this.mood) return;
    this.mood = next;
    this.step = 0;
    // a soft duck-and-recover on the master gain reads as a crossfade
    if (this.ctx && this.master && !this.muted) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.linearRampToValueAtTime(0.06, now + 0.4);
      this.master.gain.linearRampToValueAtTime(0.22, now + 1.6);
    }
    if (this.pad && this.ctx) {
      this.pad.gain.cancelScheduledValues(this.ctx.currentTime);
      this.pad.gain.setValueAtTime(this.pad.gain.value, this.ctx.currentTime);
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.ctx && this.master) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.linearRampToValueAtTime(muted ? 0 : 0.22, now + 0.4);
    }
  }

  dispose() {
    if (this.timer) window.clearTimeout(this.timer);
    this.timer = null;
    void this.ctx?.close();
    this.ctx = null;
  }
}

export const audio = new AudioManager();
