import { create } from "zustand";
import { loveNotes } from "../data/messages";
import { emoteRuntime, type EmoteType } from "../three/emoteRuntime";

/**
 * Central game state. Kept deliberately small and serialisable so that every
 * system (3D scene, HUD, audio, ending sequence) reads from one source of truth.
 */

export type Phase = "intro" | "playing" | "ending";

export type AreaId =
  | "meadow"
  | "lake"
  | "picnic"
  | "sakura"
  | "stargaze"
  | "race"
  | "heart";

export const AREA_LABELS: Record<AreaId, string> = {
  meadow: "Flower Meadow",
  lake: "Quiet Lake",
  picnic: "Picnic Spot",
  sakura: "Sakura Garden",
  stargaze: "Stargazing Hill",
  race: "Race Track",
  heart: "Heart Garden",
};

/** 0 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = sunset, wraps to 1. */
export type TimeOfDay = number;

interface GameState {
  phase: Phase;
  area: AreaId;
  objective: string;
  time: TimeOfDay;
  autoTime: boolean;
  muted: boolean;

  hearts: number;
  flowers: number;
  notesRead: number[]; // indexes of love notes already opened

  activeMessage: string | null; // currently displayed message, or null

  riding: "swing" | "car" | "slide" | null; // active mini-game ride
  emote: EmoteType | null; // active couple emote (kiss/cuddle/…)
  swingBest: number; // best swing height reached (cm-ish, for fun)

  // racing
  raceLap: number; // completed laps (0..3)
  raceTimeMs: number; // live elapsed time
  raceFinished: boolean;
  raceBestMs: number | null;

  // actions
  start: () => void;
  setArea: (area: AreaId) => void;
  setObjective: (text: string) => void;
  setTime: (t: TimeOfDay) => void;
  toggleAutoTime: () => void;
  toggleMute: () => void;
  addHeart: (n?: number) => void;
  addFlower: (n?: number) => void;
  openNote: (index: number) => void; // opens a numbered love note (+1 heart)
  showMessage: (text: string) => void; // shows an arbitrary message
  closeNote: () => void;
  mountSwing: () => void;
  dismountSwing: () => void;
  reportSwingHeight: (cm: number) => void;
  startSlide: () => void;
  endRide: () => void;
  playEmote: (type: EmoteType) => void;
  clearEmote: () => void;
  startRace: () => void;
  leaveRace: () => void;
  setRaceProgress: (lap: number, timeMs: number) => void;
  finishRace: (timeMs: number) => void;
  triggerEnding: () => void;
}

export const RACE_LAPS = 3;

export const useGame = create<GameState>((set, get) => ({
  phase: "intro",
  area: "meadow",
  objective: "Wander and explore the little world ❤️",
  time: 0.42, // bright late morning
  autoTime: false, // stay in lovely daylight until she flips it on
  muted: false,

  hearts: 0,
  flowers: 0,
  notesRead: [],
  activeMessage: null,
  riding: null,
  emote: null,
  swingBest: 0,
  raceLap: 0,
  raceTimeMs: 0,
  raceFinished: false,
  raceBestMs: null,

  start: () => set({ phase: "playing" }),
  setArea: (area) => set({ area }),
  setObjective: (objective) => set({ objective }),
  setTime: (time) => set({ time: ((time % 1) + 1) % 1 }),
  toggleAutoTime: () => set((s) => ({ autoTime: !s.autoTime })),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  addHeart: (n = 1) => set((s) => ({ hearts: s.hearts + n })),
  addFlower: (n = 1) => set((s) => ({ flowers: s.flowers + n })),

  openNote: (index) =>
    set((s) => {
      const safe = ((index % loveNotes.length) + loveNotes.length) % loveNotes.length;
      const already = s.notesRead.includes(safe);
      return {
        activeMessage: loveNotes[safe],
        hearts: already ? s.hearts : s.hearts + 1,
        notesRead: already ? s.notesRead : [...s.notesRead, safe],
      };
    }),
  showMessage: (text) => set({ activeMessage: text }),
  closeNote: () => set({ activeMessage: null }),

  mountSwing: () => set({ riding: "swing", objective: "Press SPACE to swing higher! ✨" }),
  dismountSwing: () =>
    set({ riding: null, objective: "Wander and explore the little world ❤️" }),
  startSlide: () => set({ riding: "slide", objective: "Wheeee! 🛝" }),
  endRide: () =>
    set({ riding: null, objective: "Wander and explore the little world ❤️" }),
  playEmote: (type) => {
    if (get().riding) return; // not while mid-ride
    emoteRuntime.begin(type);
    set({ emote: type });
  },
  clearEmote: () => set({ emote: null }),
  reportSwingHeight: (cm) =>
    set((s) => (cm > s.swingBest ? { swingBest: Math.round(cm) } : {})),

  startRace: () =>
    set({
      riding: "car",
      raceLap: 0,
      raceTimeMs: 0,
      raceFinished: false,
      objective: `Drive around the park! W go · A/D steer · hop off (E) near any game · ${RACE_LAPS} laps to race`,
    }),
  leaveRace: () =>
    set({ riding: null, objective: "Wander and explore the little world ❤️" }),
  setRaceProgress: (lap, timeMs) =>
    set((s) => (s.raceFinished ? {} : { raceLap: lap, raceTimeMs: timeMs })),
  finishRace: (timeMs) =>
    set((s) => ({
      raceFinished: true,
      raceTimeMs: timeMs,
      raceBestMs: s.raceBestMs == null ? timeMs : Math.min(s.raceBestMs, timeMs),
    })),

  triggerEnding: () => {
    if (get().phase !== "ending") set({ phase: "ending", area: "heart" });
  },
}));
