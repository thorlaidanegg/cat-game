import { Vector3 } from "three";
import type { AreaId } from "../store/useGame";

/** Centre point + radius of each themed area in the connected world. */
export interface AreaDef {
  id: AreaId;
  center: Vector3;
  radius: number;
}

export const AREAS: AreaDef[] = [
  { id: "meadow", center: new Vector3(0, 0, 0), radius: 22 },
  { id: "lake", center: new Vector3(-38, 0, -8), radius: 18 },
  { id: "picnic", center: new Vector3(34, 0, 6), radius: 16 },
  { id: "sakura", center: new Vector3(8, 0, -40), radius: 18 },
  { id: "stargaze", center: new Vector3(40, 0, -38), radius: 16 },
  { id: "race", center: new Vector3(52, 0, 30), radius: 32 },
  { id: "heart", center: new Vector3(-30, 0, 40), radius: 16 },
];

export const WORLD_RADIUS = 100;

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
