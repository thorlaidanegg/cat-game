import { Vector3 } from "three";

/**
 * Live state for the race car, shared between the Cat (driving physics + lap
 * logic) and the Car mesh (rendering). The track centerline is published here
 * as evenly-spaced samples so the car can be kept on any track shape and lap
 * progress can be measured on any closed circuit (not just an ellipse).
 */
export const carRuntime = {
  pos: new Vector3(0, 0, 0),
  heading: 0,
  speed: 0,
  wheelSpin: 0,
  steer: 0, // smoothed steering angle, for front-wheel visuals

  half: 5, // road half-width
  samples: [] as Vector3[], // centerline points (world space), evenly spaced
  start: new Vector3(),
  startHeading: 0,

  // lap progress (in units of full laps; 0..RACE_LAPS)
  prevFrac: 0,
  progress: 0,
  started: false,
  startMs: 0,

  reset() {
    this.pos.copy(this.start);
    this.heading = this.startHeading;
    this.speed = 0;
    this.steer = 0;
    this.progress = 0;
    this.prevFrac = 0;
    this.started = false;
    this.startMs = 0;
  },
};
