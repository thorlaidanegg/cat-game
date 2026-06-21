import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { InstancedMesh, Object3D } from "three";
import { seeded } from "../layout";

/**
 * Falling petals/leaves using a single InstancedMesh for performance.
 * Each petal falls, drifts on the wind and tumbles, then respawns at the top.
 */
export default function Petals({
  count = 90,
  center = [0, 0, 0],
  spread = 26,
  color = "#ffc3df",
}: {
  count?: number;
  center?: [number, number, number];
  spread?: number;
  color?: string;
}) {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  const data = useMemo(() => {
    const rnd = seeded(33);
    return Array.from({ length: count }).map(() => ({
      x: center[0] + (rnd() - 0.5) * spread,
      y: rnd() * 10,
      z: center[2] + (rnd() - 0.5) * spread,
      speed: 0.6 + rnd() * 0.8,
      drift: rnd() * Math.PI * 2,
      spin: 0.5 + rnd() * 1.5,
      scale: 0.08 + rnd() * 0.08,
    }));
  }, [count, center, spread]);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    data.forEach((d, i) => {
      d.y -= d.speed * delta;
      if (d.y < 0) d.y = 9 + Math.random() * 2;
      dummy.position.set(d.x + Math.sin(t * 0.5 + d.drift) * 1.5, d.y, d.z + Math.cos(t * 0.4 + d.drift) * 1.5);
      dummy.rotation.set(t * d.spin, t * d.spin * 0.7, d.drift);
      dummy.scale.setScalar(d.scale);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1.4]} />
      <meshStandardMaterial color={color} side={2} transparent opacity={0.9} />
    </instancedMesh>
  );
}
