import { useEffect, useRef } from "react";
import { joystickVector } from "./joystick";

/** Snapshot of the controls we read every frame. */
export interface InputState {
  forward: number; // -1..1
  strafe: number; // -1..1
  run: boolean;
  jump: boolean;
  // camera orbit, driven by pointer drag (desktop) or touch (mobile joystick lives separately)
  yaw: number;
  pitch: number;
}

/**
 * Keyboard (WASD / arrows / shift / space) + pointer-drag camera orbit.
 * Returns a ref so the render loop can read without re-rendering React.
 * A mobile joystick can also write into `joystick` to drive movement.
 */
export function useInput() {
  const input = useRef<InputState>({
    forward: 0,
    strafe: 0,
    run: false,
    jump: false,
    yaw: Math.PI, // start looking "south" so the world opens up ahead
    pitch: 0.5,
  });
  const keys = useRef<Record<string, boolean>>({});
  const joystick = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === "Space") e.preventDefault();
    };
    const up = (e: KeyboardEvent) => (keys.current[e.code] = false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    // pointer-drag to orbit the camera
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const isUI = (t: EventTarget | null) =>
      t instanceof HTMLElement && t.closest("button,input,a,[data-ui]");

    const pd = (e: PointerEvent) => {
      if (isUI(e.target)) return;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const pm = (e: PointerEvent) => {
      if (!dragging) return;
      input.current.yaw -= (e.clientX - lastX) * 0.005;
      input.current.pitch = Math.min(
        1.15,
        Math.max(0.05, input.current.pitch - (e.clientY - lastY) * 0.004)
      );
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const pu = () => (dragging = false);

    window.addEventListener("pointerdown", pd);
    window.addEventListener("pointermove", pm);
    window.addEventListener("pointerup", pu);
    window.addEventListener("pointercancel", pu);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("pointerdown", pd);
      window.removeEventListener("pointermove", pm);
      window.removeEventListener("pointerup", pu);
      window.removeEventListener("pointercancel", pu);
    };
  }, []);

  /** Call once per frame to fold keyboard + joystick into forward/strafe. */
  const sample = () => {
    const k = keys.current;
    let f = 0;
    let s = 0;
    if (k["KeyW"] || k["ArrowUp"]) f += 1;
    if (k["KeyS"] || k["ArrowDown"]) f -= 1;
    if (k["KeyD"] || k["ArrowRight"]) s += 1;
    if (k["KeyA"] || k["ArrowLeft"]) s -= 1;
    // joystick overrides if active
    if (joystickVector.active) {
      f = -joystickVector.y;
      s = joystickVector.x;
    }
    input.current.forward = f;
    input.current.strafe = s;
    input.current.run = !!(k["ShiftLeft"] || k["ShiftRight"]);
    input.current.jump = !!k["Space"];
    return input.current;
  };

  return { input, joystick, sample };
}
