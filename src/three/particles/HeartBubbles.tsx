import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { useGame } from "../../store/useGame";
import { seeded } from "../layout";

/**
 * Mini-game: floating heart bubbles drift upward across the meadow. Pop one to
 * collect a heart and a little burst. Popped bubbles respawn at the bottom so
 * there's always something cute to chase.
 */
export default function HeartBubbles({ count = 16 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Bubble key={i} seed={i + 1} />
      ))}
    </>
  );
}

function Bubble({ seed }: { seed: number }) {
  const g = useRef<Group>(null);
  const rnd = useMemo(() => seeded(seed * 131 + 5), [seed]);
  const cfg = useMemo(
    () => ({
      x: (rnd() - 0.5) * 36,
      z: (rnd() - 0.5) * 36,
      speed: 0.6 + rnd() * 0.7,
      sway: rnd() * Math.PI * 2,
      base: rnd() * 8,
    }),
    [rnd]
  );
  const y = useRef(cfg.base);
  const [popped, setPopped] = useState(false);
  const popT = useRef(0);

  useFrame((state, delta) => {
    if (!g.current) return;
    if (popped) {
      popT.current += delta;
      const s = Math.max(0, 1 - popT.current * 4);
      g.current.scale.setScalar(s * 0.4);
      if (popT.current > 0.3) {
        // respawn below
        setPopped(false);
        popT.current = 0;
        y.current = 0.5;
      }
      return;
    }
    y.current += cfg.speed * delta;
    if (y.current > 9) y.current = 0.5;
    const t = state.clock.elapsedTime;
    g.current.position.set(cfg.x + Math.sin(t * 0.6 + cfg.sway) * 1.2, y.current, cfg.z + Math.cos(t * 0.5 + cfg.sway) * 1.2);
    g.current.scale.setScalar(0.4 + Math.sin(t * 3 + seed) * 0.03);
    g.current.rotation.y = t * 0.5;
  });

  return (
    <group
      ref={g}
      onClick={(e) => {
        e.stopPropagation();
        if (popped) return;
        setPopped(true);
        useGame.getState().addHeart(1);
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      {/* two spheres + a cone make a chubby heart */}
      <mesh position={[-0.25, 0.15, 0]}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color="#ff7aa8" transparent opacity={0.85} emissive="#ff4f86" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0.25, 0.15, 0]}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color="#ff7aa8" transparent opacity={0.85} emissive="#ff4f86" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, -0.3, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.45, 0.7, 16]} />
        <meshStandardMaterial color="#ff7aa8" transparent opacity={0.85} emissive="#ff4f86" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}
