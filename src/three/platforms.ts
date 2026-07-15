/**
 * Walkable surfaces for the Home — a big FOUR-storey house both cats live in.
 *
 * A wide open central staircase marches up the middle (three flights) so it's
 * easy to climb. Ground: living/kitchen/bathroom. Floor 2: girly room. Floor 3:
 * boy room + balcony. Floor 4: GYM. Visuals (Home.tsx) read these same values.
 *
 * Footprint: x[-16,16], z[-42,-2].
 */
export interface Support {
  kind: "slab" | "ramp";
  cx: number;
  cz: number;
  w: number;
  d: number;
  top: number;
  topAtZmin?: number;
  topAtZmax?: number;
}

export const HOME = { x: 0, z: -22, w: 32, d: 40 };
export const F2 = 5;
export const F3 = 10;
export const F4 = 15;

export const SUPPORTS: Support[] = [
  // Floor slabs (each covers the back area behind its staircase flight)
  { kind: "slab", cx: 0, cz: -29, w: 32, d: 26, top: F2 }, // z[-42,-16]
  { kind: "slab", cx: 0, cz: -32, w: 32, d: 20, top: F3 }, // z[-42,-22]
  { kind: "slab", cx: 0, cz: -37, w: 32, d: 10, top: F4 }, // z[-42,-32]

  // Floor 3 balcony wings (front, sides), centre kept open for the stairs
  { kind: "slab", cx: -11, cz: -19, w: 10, d: 6, top: F3 }, // x[-16,-6] z[-22,-16]
  { kind: "slab", cx: 11, cz: -19, w: 10, d: 6, top: F3 }, // x[6,16] z[-22,-16]

  // central staircase: ground → F2 → F3 → F4 (each flight climbs toward -Z)
  { kind: "ramp", cx: 0, cz: -10, w: 6, d: 12, topAtZmin: F2, topAtZmax: 0, top: F2 }, // z[-16,-4]
  { kind: "ramp", cx: 0, cz: -19, w: 6, d: 6, topAtZmin: F3, topAtZmax: F2, top: F3 }, // z[-22,-16]
  { kind: "ramp", cx: 0, cz: -27, w: 6, d: 10, topAtZmin: F4, topAtZmax: F3, top: F4 }, // z[-32,-22]
];

const STEP = 0.55;

/** Height of the highest walkable surface under (x,z) reachable from `fromY`. */
export function floorAt(x: number, z: number, fromY: number): number {
  let best = 0;
  for (const s of SUPPORTS) {
    if (x < s.cx - s.w / 2 || x > s.cx + s.w / 2) continue;
    if (z < s.cz - s.d / 2 || z > s.cz + s.d / 2) continue;
    let top = s.top;
    if (s.kind === "ramp") {
      const t = (z - (s.cz - s.d / 2)) / s.d;
      top = s.topAtZmin! + (s.topAtZmax! - s.topAtZmin!) * t;
    }
    if (top <= fromY + STEP && top > best) best = top;
  }
  return best;
}
