import { Vector3 } from "three";

export interface CarRT {
  pos: Vector3;
  heading: number;
  speed: number;
  wheelSpin: number;
  steer: number;
  y: number; // height above the road (for ramp jumps)
  vy: number;
  airborne: boolean;
  prevFrac: number;
  progress: number;
  started: boolean;
  startMs: number;
}

function makeCar(): CarRT {
  return {
    pos: new Vector3(),
    heading: 0,
    speed: 0,
    wheelSpin: 0,
    steer: 0,
    y: 0,
    vy: 0,
    airborne: false,
    prevFrac: 0,
    progress: 0,
    started: false,
    startMs: 0,
  };
}

/**
 * Player car. The track centerline is published on `carRuntime.samples` by the
 * RaceTrack and shared by the AI car too.
 */
export const carRuntime = {
  ...makeCar(),
  half: 5,
  samples: [] as Vector3[],
  start: new Vector3(),
  startHeading: 0,
  reset() {
    this.pos.copy(this.start);
    this.heading = this.startHeading;
    this.speed = 0;
    this.steer = 0;
    this.y = 0;
    this.vy = 0;
    this.airborne = false;
    this.progress = 0;
    this.prevFrac = 0;
    this.started = false;
    this.startMs = 0;
  },
};

/** The AI opponent car (driven by the companion cat). Shares the track. */
export const aiCar = {
  ...makeCar(),
  reset(start: Vector3, heading: number) {
    this.pos.copy(start);
    this.heading = heading;
    this.speed = 0;
    this.steer = 0;
    this.y = 0;
    this.vy = 0;
    this.airborne = false;
    this.progress = 0;
    this.prevFrac = 0;
    this.started = false;
    this.startMs = 0;
  },
};
