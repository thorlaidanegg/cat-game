import { useRef, useState } from "react";
import { joystickVector } from "../three/controls/joystick";

const RADIUS = 56; // px the knob can travel

/**
 * A floating touch joystick (mobile). Writes a normalised vector into the
 * shared `joystickVector` which the cat controller reads each frame. Hidden on
 * pointer-fine devices via the `sm:hidden`-style media query in CSS.
 */
export default function Joystick() {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const active = useRef(false);

  const update = (clientX: number, clientY: number) => {
    const el = base.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > RADIUS) {
      dx = (dx / dist) * RADIUS;
      dy = (dy / dist) * RADIUS;
    }
    setKnob({ x: dx, y: dy });
    joystickVector.x = dx / RADIUS;
    joystickVector.y = dy / RADIUS;
    joystickVector.active = true;
  };

  const end = () => {
    active.current = false;
    setKnob({ x: 0, y: 0 });
    joystickVector.x = 0;
    joystickVector.y = 0;
    joystickVector.active = false;
  };

  return (
    <div
      data-ui
      className="pointer-events-auto fixed bottom-8 left-8 z-20 touch-none select-none [@media(pointer:fine)]:hidden"
      onPointerDown={(e) => {
        active.current = true;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        update(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => active.current && update(e.clientX, e.clientY)}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div
        ref={base}
        className="relative flex h-32 w-32 items-center justify-center rounded-full bg-white/30 backdrop-blur"
      >
        <div
          className="h-14 w-14 rounded-full bg-petal/80 shadow-soft"
          style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
        />
      </div>
    </div>
  );
}
