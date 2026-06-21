import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BufferAttribute, Points } from "three";
import { useGame } from "../../store/useGame";
import { seeded } from "../layout";

/**
 * GPU points that drift like fireflies. They fade in only at night via the
 * material opacity, driven by the global time of day.
 */
export default function Fireflies({ count = 120, area = 70 }: { count?: number; area?: number }) {
  const points = useRef<Points>(null);
  const matRef = useRef<any>(null);

  const { positions, seeds } = useMemo(() => {
    const rnd = seeded(7);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rnd() - 0.5) * area;
      positions[i * 3 + 1] = 0.5 + rnd() * 4;
      positions[i * 3 + 2] = (rnd() - 0.5) * area;
      seeds[i] = rnd() * Math.PI * 2;
    }
    return { positions, seeds };
  }, [count, area]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (points.current) {
      const attr = points.current.geometry.getAttribute("position") as BufferAttribute;
      for (let i = 0; i < count; i++) {
        attr.array[i * 3 + 1] = 1.5 + Math.sin(t * 0.6 + seeds[i]) * 0.8 + Math.sin(t + i) * 0.3;
      }
      attr.needsUpdate = true;
    }
    // visible only when it's dark
    const time = useGame.getState().time;
    const night = time < 0.22 || time > 0.8 ? 1 : 0;
    if (matRef.current) {
      matRef.current.opacity += (night * (0.6 + Math.sin(t * 4) * 0.2) - matRef.current.opacity) * 0.05;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={0.22}
        color="#fff3b0"
        transparent
        opacity={0}
        blending={AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
