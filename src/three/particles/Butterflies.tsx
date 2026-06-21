import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { seeded } from "../layout";

/**
 * A flock of pastel butterflies that wander in lazy looping paths and flap
 * their wings. Cheap: each is two thin boxes + a body, animated on the CPU.
 */
export default function Butterflies({
  count = 14,
  center = [0, 0, 0],
  spread = 24,
}: {
  count?: number;
  center?: [number, number, number];
  spread?: number;
}) {
  const refs = useRef<(Group | null)[]>([]);
  const wings = useRef<(Group | null)[]>([]);

  const data = useMemo(() => {
    const rnd = seeded(99);
    const colors = ["#ffd36e", "#ff9ec2", "#b6e3ff", "#d6a8ff", "#ffb38a"];
    return Array.from({ length: count }).map(() => ({
      cx: center[0] + (rnd() - 0.5) * spread,
      cz: center[2] + (rnd() - 0.5) * spread,
      radius: 1.5 + rnd() * 3,
      height: 1 + rnd() * 2.5,
      speed: 0.4 + rnd() * 0.8,
      phase: rnd() * Math.PI * 2,
      flap: 8 + rnd() * 6,
      color: colors[Math.floor(rnd() * colors.length)],
    }));
  }, [count, center, spread]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    data.forEach((d, i) => {
      const g = refs.current[i];
      if (!g) return;
      const a = t * d.speed + d.phase;
      g.position.set(
        d.cx + Math.cos(a) * d.radius,
        d.height + Math.sin(a * 2) * 0.4,
        d.cz + Math.sin(a) * d.radius
      );
      g.rotation.y = -a + Math.PI / 2;
      const w = wings.current[i];
      if (w) w.rotation.z = Math.sin(t * d.flap) * 0.9;
    });
  });

  return (
    <>
      {data.map((d, i) => (
        <group key={i} ref={(r) => (refs.current[i] = r)}>
          {/* body */}
          <mesh>
            <capsuleGeometry args={[0.03, 0.16, 4, 6]} />
            <meshStandardMaterial color="#5a4636" />
          </mesh>
          <group ref={(r) => (wings.current[i] = r)}>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.12, 0, 0]} rotation={[0, 0, s * 0.3]}>
                <planeGeometry args={[0.24, 0.34]} />
                <meshStandardMaterial color={d.color} side={2} transparent opacity={0.92} />
              </mesh>
            ))}
          </group>
        </group>
      ))}
    </>
  );
}
