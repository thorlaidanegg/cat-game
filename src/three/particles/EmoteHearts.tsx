import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BufferAttribute, Color, Points } from "three";
import { useGame } from "../../store/useGame";
import { catRuntime } from "../catRuntime";
import { companionRuntime } from "../emoteRuntime";

const COUNT = 90;
const COLORS = ["#ff7aa8", "#ff9ec2", "#ffd6e6", "#ffffff"];

/**
 * Soft pink hearts/sparkles that rise from between the two cats whenever a
 * couple emote is playing. One recycled Points pool, integrated on the CPU.
 */
export default function EmoteHearts() {
  const points = useRef<Points>(null);

  const { positions, colors, vel, life } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const vel = new Float32Array(COUNT * 3);
    const life = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) positions[i * 3 + 1] = -999;
    return { positions, colors, vel, life };
  }, []);

  const emit = useRef(0);
  const scratch = useMemo(() => new Color(), []);

  useFrame((_, dt) => {
    const active = useGame.getState().emote !== null;
    const pts = points.current;
    if (!pts) return;
    const pos = pts.geometry.getAttribute("position") as BufferAttribute;
    const col = pts.geometry.getAttribute("color") as BufferAttribute;

    // midpoint between the two cats, a little above the ground
    const mx = (catRuntime.pos.x + companionRuntime.pos.x) / 2;
    const mz = (catRuntime.pos.z + companionRuntime.pos.z) / 2;

    if (active) {
      emit.current -= dt;
      if (emit.current <= 0) {
        emit.current = 0.07;
        for (let n = 0; n < 2; n++) {
          for (let i = 0; i < COUNT; i++) {
            if (life[i] > 0) continue;
            scratch.set(COLORS[Math.floor(Math.random() * COLORS.length)]);
            pos.array[i * 3] = mx + (Math.random() - 0.5) * 0.8;
            pos.array[i * 3 + 1] = 1.4 + Math.random() * 0.4;
            pos.array[i * 3 + 2] = mz + (Math.random() - 0.5) * 0.8;
            vel[i * 3] = (Math.random() - 0.5) * 0.5;
            vel[i * 3 + 1] = 0.8 + Math.random() * 0.6;
            vel[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
            col.array[i * 3] = scratch.r;
            col.array[i * 3 + 1] = scratch.g;
            col.array[i * 3 + 2] = scratch.b;
            life[i] = 1.2 + Math.random() * 0.6;
            break;
          }
        }
      }
    }

    for (let i = 0; i < COUNT; i++) {
      if (life[i] <= 0) {
        if (pos.array[i * 3 + 1] !== -999) pos.array[i * 3 + 1] = -999;
        continue;
      }
      life[i] -= dt;
      pos.array[i * 3] += vel[i * 3] * dt;
      pos.array[i * 3 + 1] += vel[i * 3 + 1] * dt;
      pos.array[i * 3 + 2] += vel[i * 3 + 2] * dt;
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.4}
        vertexColors
        transparent
        opacity={0.95}
        blending={AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
