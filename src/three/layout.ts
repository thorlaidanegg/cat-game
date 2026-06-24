import { Vector3 } from "three";
import type { AreaId } from "../store/useGame";

/** Centre point + radius of each themed area in the connected world. */
export interface AreaDef {
  id: AreaId;
  center: Vector3;
  radius: number;
}

export const AREAS: AreaDef[] = [
  { id: "meadow", center: new Vector3(0, 0, 0), radius: 30 },
  { id: "lake", center: new Vector3(-57, 0, -12), radius: 24 },
  { id: "picnic", center: new Vector3(51, 0, 9), radius: 22 },
  { id: "sakura", center: new Vector3(12, 0, -60), radius: 24 },
  { id: "stargaze", center: new Vector3(60, 0, -57), radius: 22 },
  { id: "race", center: new Vector3(78, 0, 45), radius: 36 },
  { id: "heart", center: new Vector3(-45, 0, 60), radius: 22 },
];

export const WORLD_RADIUS = 150;

/** Returns the area whose centre is nearest to a given world position. */
export function areaAt(pos: Vector3): AreaId {
  let best: AreaId = "meadow";
  let bestDist = Infinity;
  for (const a of AREAS) {
    const d = pos.distanceTo(a.center);
    if (d < bestDist) {
      bestDist = d;
      best = a.id;
    }
  }
  return best;
}

export function areaCenter(id: AreaId): Vector3 {
  return (AREAS.find((a) => a.id === id) ?? AREAS[0]).center;
}

/** Deterministic pseudo-random so the world looks identical every visit. */
export function seeded(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
