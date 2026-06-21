import { Vector3 } from "three";

/**
 * Live state for a slide ride. A chute publishes its top/bottom world points
 * here when clicked; the Cat then animates from `from` to `to` along it.
 */
export const slideRuntime = {
  from: new Vector3(),
  to: new Vector3(),
  pos: new Vector3(),
  t: 0, // 0..1 progress
  dur: 1.1, // seconds to slide down

  begin(from: Vector3, to: Vector3) {
    this.from.copy(from);
    this.to.copy(to);
    this.pos.copy(from);
    this.t = 0;
  },
};
