/**
 * Walkable surfaces for the multi-level playhouse.
 *
 * Both the House visuals and the cat's "what's under my feet" logic read from
 * this single list so they can never disagree. Each support is an axis-aligned
 * footprint with either a flat top (`slab`) or a linearly sloped top along Z
 * (`ramp`) so the cat can walk up smoothly with no gaps.
 */
export interface Support {
  kind: "slab" | "ramp";
  cx: number;
  cz: number;
  w: number; // size along X
  d: number; // size along Z
  top: number; // slab: the surface height
  // ramp only: surface goes from `topAtZmin` (at cz-d/2) to `topAtZmax` (at cz+d/2)
  topAtZmin?: number;
  topAtZmax?: number;
}

// house centre
export const HOUSE = { x: 0, z: -7 };

const L1 = 3.2; // first-floor height
const L2 = 6.4; // loft height

// first floor slab: x[-5,5], z[-12,-2]
// loft slab:        x[-5,0], z[-12,-7]
export const SUPPORTS: Support[] = [
  // ground floor is just the island (y=0), handled implicitly by floorAt

  { kind: "slab", cx: HOUSE.x, cz: HOUSE.z, w: 10, d: 10, top: L1 },
  { kind: "slab", cx: HOUSE.x - 2.5, cz: HOUSE.z - 2.5, w: 5, d: 5, top: L2 },

  // ramp A: ground -> first floor, in front of the house (z 2 → -2). Top end
  // (z=-2) meets the first-floor front edge exactly.
  { kind: "ramp", cx: HOUSE.x, cz: HOUSE.z + 7, w: 3.4, d: 4, topAtZmin: L1, topAtZmax: 0, top: L1 },
  // ramp B: first floor -> loft (z -2 → -7). Top end (z=-7) meets the loft edge.
  { kind: "ramp", cx: HOUSE.x - 2.5, cz: HOUSE.z + 2.5, w: 3, d: 5, topAtZmin: L2, topAtZmax: L1, top: L2 },
];

const STEP = 0.85; // how high the cat can step/clamber up in one go

/** Height of the highest walkable surface under (x,z) reachable from `fromY`. */
export function floorAt(x: number, z: number, fromY: number): number {
  let best = 0; // the island
  for (const s of SUPPORTS) {
    if (x < s.cx - s.w / 2 || x > s.cx + s.w / 2) continue;
    if (z < s.cz - s.d / 2 || z > s.cz + s.d / 2) continue;
    let top = s.top;
    if (s.kind === "ramp") {
      const t = (z - (s.cz - s.d / 2)) / s.d; // 0 at zmin .. 1 at zmax
      top = s.topAtZmin! + (s.topAtZmax! - s.topAtZmin!) * t;
    }
    if (top <= fromY + STEP && top > best) best = top;
  }
  return best;
}
