/**
 * Walkable surfaces for the big connected playhouse / adventure course.
 *
 * Both the visuals (MegaPlayhouse) and the cat's "what's under my feet" logic
 * read from this one list so they can never disagree. Each support is an
 * axis-aligned footprint with either a flat top (`slab`) or a top that slopes
 * linearly along Z (`ramp`).
 *
 * The course: ground → front ramp → Deck 1 terrace → (easy ramp OR jump the
 * floating stepping-stones obstacle) → Deck 2 loft / crow's-nest → whoosh down
 * a slide. See MegaPlayhouse for the matching geometry + the slide chutes.
 */
export interface Support {
  kind: "slab" | "ramp";
  cx: number;
  cz: number;
  w: number;
  d: number;
  top: number;
  topAtZmin?: number; // ramp: top at z = cz - d/2
  topAtZmax?: number; // ramp: top at z = cz + d/2
}

export const HOUSE = { x: 0, z: -8 };

export const L1 = 3.2;
export const L2 = 6.4;

export const SUPPORTS: Support[] = [
  // Deck 1 — big terrace (ground room sits open underneath). x[-6,6] z[-13,-3]
  { kind: "slab", cx: 0, cz: -8, w: 12, d: 10, top: L1 },
  // Deck 2 — loft, back-left. x[-6,-1] z[-13,-8]
  { kind: "slab", cx: -3.5, cz: -10.5, w: 5, d: 5, top: L2 },
  // crow's-nest at the top of the obstacle run. x[11,15] z[-10,-6]
  { kind: "slab", cx: 13, cz: -8, w: 4, d: 4, top: L2 },

  // ramp: ground → Deck 1 (front, z 1 → -3)
  { kind: "ramp", cx: 0, cz: -1, w: 3, d: 4, topAtZmin: L1, topAtZmax: 0, top: L1 },
  // ramp: Deck 1 → Deck 2 (easy path, z -5 → -8)
  { kind: "ramp", cx: -3.5, cz: -6.5, w: 3, d: 3, topAtZmin: L2, topAtZmax: L1, top: L2 },

  // OBSTACLE: floating stepping-stones from Deck 1 up to the crow's-nest.
  { kind: "slab", cx: 5, cz: -8, w: 2, d: 2, top: 4.2 },
  { kind: "slab", cx: 7.7, cz: -8, w: 1.9, d: 1.9, top: 5.1 },
  { kind: "slab", cx: 10.3, cz: -8, w: 1.9, d: 1.9, top: 6.0 },
];

const STEP = 0.55; // auto step-up height (bigger gaps need a real jump)

/** Height of the highest walkable surface under (x,z) reachable from `fromY`. */
export function floorAt(x: number, z: number, fromY: number): number {
  let best = 0; // the island
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
