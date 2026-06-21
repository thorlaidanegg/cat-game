import { Vector3 } from "three";

/**
 * Render-loop hooks for the cat that live outside React. The games panel can
 * request a teleport; the Cat consumes it on the next frame and clears it.
 */
export const catRuntime = {
  teleport: null as Vector3 | null,
  pos: new Vector3(0, 0, 6), // live player-cat position (published each frame)
  heading: 0,
  moving: false,
  goTo(x: number, z: number) {
    this.teleport = new Vector3(x, 0, z);
  },
};
