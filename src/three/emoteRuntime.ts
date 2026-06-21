import { Vector3 } from "three";

export type EmoteType = "kiss" | "cuddle" | "nuzzle" | "dance";

/** Shared emote state, driven by the CompanionCat and read by the player Cat. */
export const emoteRuntime = {
  type: null as EmoteType | null,
  t: 0,
  dur: 2.4,
  begin(type: EmoteType) {
    this.type = type;
    this.t = 0;
    this.dur = type === "dance" ? 3.2 : type === "cuddle" ? 3.0 : 2.4;
  },
};

/** Live companion-cat position so the player cat can turn to face it. */
export const companionRuntime = {
  pos: new Vector3(1.6, 0, 7.5),
};
