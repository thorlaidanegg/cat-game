/**
 * Shared, render-loop-friendly joystick vector. The DOM joystick (mobile UI)
 * writes into it; the cat controller reads it each frame. Range roughly -1..1.
 */
export const joystickVector = { x: 0, y: 0, active: false };
