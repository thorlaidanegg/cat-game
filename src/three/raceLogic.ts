import { Vector3 } from "three";
import { carRuntime, aiCar, type CarRT } from "./carRuntime";

/** Reset both cars to the start line (AI placed just beside the player). */
export function resetRace() {
  carRuntime.reset();
  const S = carRuntime.samples;
  let nx = 1;
  let nz = 0;
  if (S.length > 2) {
    let tx = S[1].x - S[0].x;
    let tz = S[1].z - S[0].z;
    const l = Math.hypot(tx, tz) || 1;
    nx = tz / l;
    nz = -tx / l;
  }
  aiCar.reset(new Vector3(carRuntime.start.x + nx * 2.6, 0, carRuntime.start.z + nz * 2.6), carRuntime.startHeading);
}

/** World positions of the jump ramps, published by RaceTrack. */
export const rampPads: { x: number; z: number }[] = [];

/** Launch a car into the air if it hits a ramp pad fast enough. */
export function tryRampLaunch(rt: CarRT) {
  if (rt.airborne || rt.y > 0.1) return;
  for (const r of rampPads) {
    const dx = rt.pos.x - r.x;
    const dz = rt.pos.z - r.z;
    if (dx * dx + dz * dz < 12 && rt.speed > 7) {
      rt.vy = 9.5;
      rt.airborne = true;
      rt.speed *= 1.06; // a little whee-boost
      break;
    }
  }
}

/** Integrate vertical jump motion + gravity. */
export function stepJump(rt: CarRT, delta: number) {
  if (rt.airborne || rt.y > 0) {
    rt.vy -= 26 * delta;
    rt.y += rt.vy * delta;
    if (rt.y <= 0) {
      rt.y = 0;
      rt.vy = 0;
      rt.airborne = false;
    }
  }
}

/**
 * Keep a car on the road by clamping it to the centerline, and return its lap
 * fraction (0..1) for progress/lap counting. Shared by the player + AI.
 */
export function roadFrac(rt: CarRT): number {
  const S = carRuntime.samples;
  if (S.length < 3) return rt.prevFrac;
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < S.length; i++) {
    const dx = rt.pos.x - S[i].x;
    const dz = rt.pos.z - S[i].z;
    const d = dx * dx + dz * dz;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  const p = S[best];
  const nxt = S[(best + 1) % S.length];
  let tx = nxt.x - p.x;
  let tz = nxt.z - p.z;
  const tl = Math.hypot(tx, tz) || 1;
  tx /= tl;
  tz /= tl;
  const nx = tz;
  const nz = -tx;
  const lat = (rt.pos.x - p.x) * nx + (rt.pos.z - p.z) * nz;
  const maxLat = carRuntime.half - 0.6;
  if (Math.abs(lat) > maxLat) {
    const pull = lat - Math.sign(lat) * maxLat;
    rt.pos.x -= nx * pull;
    rt.pos.z -= nz * pull;
    rt.speed *= 0.985;
  }
  return best / S.length;
}

/** Index of the nearest centerline sample to a world position. */
export function nearestIndex(x: number, z: number): number {
  const S = carRuntime.samples;
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < S.length; i++) {
    const dx = x - S[i].x;
    const dz = z - S[i].z;
    const d = dx * dx + dz * dz;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

/** Advance lap progress on the closed curve; returns completed laps. */
export function advanceLaps(rt: CarRT, frac: number): number {
  let d = frac - rt.prevFrac;
  if (d > 0.5) d -= 1;
  if (d < -0.5) d += 1;
  rt.progress += d;
  rt.prevFrac = frac;
  return Math.max(0, Math.floor(rt.progress));
}
