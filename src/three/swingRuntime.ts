import { Vector3 } from "three";

/**
 * Live, render-loop state for the swing mini-game. The Swing component owns the
 * physics and writes the seat transform here; the Cat reads it to ride along.
 */
export const swingRuntime = {
  amplitude: 0.25, // current swing arc (radians)
  phase: 0,
  angle: 0, // current tilt of the swing
  seat: new Vector3(), // world position of the seat
  yaw: 0, // world facing of the swing
  pumpRequested: false, // set true on each SPACE press while riding
  // the world position of the swing frame (set once by the Swing component)
  base: new Vector3(),
};
