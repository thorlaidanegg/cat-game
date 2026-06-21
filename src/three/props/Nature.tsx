import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils } from "three";
import { useGame } from "../../store/useGame";
import { pickInteraction } from "../../data/messages";

const PASTELS = ["#ff9ec2", "#ffd36e", "#b6e3ff", "#d6a8ff", "#ffb38a", "#fff0a3"];

/** Lighten/darken a #rrggbb hex by a multiplier (clamped). */
function shade(hex: string, m: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.round(((n >> 16) & 255) * m));
  const g = Math.min(255, Math.round(((n >> 8) & 255) * m));
  const b = Math.min(255, Math.round((n & 255) * m));
  return `rgb(${r},${g},${b})`;
}

/** A single cheerful flower that sways in the wind and can be picked. */
export function Flower({
  position,
  color,
  scale = 1,
}: {
  position: [number, number, number];
  color?: string;
  scale?: number;
}) {
  const g = useRef<Group>(null);
  const picked = useRef(false);
  const idx = Math.abs(Math.floor(position[0] * 7 + position[2] * 3)) % PASTELS.length;
  const c = color ?? PASTELS[idx];

  useFrame((state) => {
    if (!g.current) return;
    // wind sway
    g.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.12;
    if (picked.current) {
      g.current.scale.y = MathUtils.lerp(g.current.scale.y, 0.01, 0.2);
    }
  });

  return (
    <group
      ref={g}
      position={position}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        if (picked.current) return;
        picked.current = true;
        const game = useGame.getState();
        game.addFlower(1);
        game.showMessage(pickInteraction("flower"));
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      {/* stem */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.6, 6]} />
        <meshStandardMaterial color="#6bbf6b" roughness={0.9} />
      </mesh>
      {/* petals */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.14, 0.62, Math.sin(a) * 0.14]}>
            <sphereGeometry args={[0.1, 10, 10]} />
            <meshStandardMaterial color={c} roughness={0.7} />
          </mesh>
        );
      })}
      {/* center */}
      <mesh position={[0, 0.64, 0]}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial color="#ffe17a" emissive="#ffd36e" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

/** A rounded, low-poly tree with a wobbly canopy. */
export function Tree({
  position,
  scale = 1,
  canopy = "#9be88f",
}: {
  position: [number, number, number];
  scale?: number;
  canopy?: string;
}) {
  const top = useRef<Group>(null);
  useFrame((state) => {
    if (top.current)
      top.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.04;
  });
  return (
    <group
      position={position}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        useGame.getState().showMessage(pickInteraction("tree"));
      }}
    >
      {/* tapered trunk */}
      <mesh castShadow position={[0, 1, 0]}>
        <cylinderGeometry args={[0.22, 0.38, 2, 10]} />
        <meshStandardMaterial color="#b98563" roughness={0.95} />
      </mesh>
      <group ref={top} position={[0, 2.4, 0]}>
        {/* base canopy clusters */}
        <mesh castShadow>
          <sphereGeometry args={[1.15, 20, 16]} />
          <meshStandardMaterial color={canopy} roughness={0.85} />
        </mesh>
        <mesh castShadow position={[0.75, 0.3, 0.2]}>
          <sphereGeometry args={[0.75, 18, 14]} />
          <meshStandardMaterial color={canopy} roughness={0.85} />
        </mesh>
        <mesh castShadow position={[-0.65, 0.1, -0.3]}>
          <sphereGeometry args={[0.7, 18, 14]} />
          <meshStandardMaterial color={canopy} roughness={0.85} />
        </mesh>
        {/* lighter sun-kissed highlights on top */}
        <mesh position={[0.1, 0.7, 0.4]}>
          <sphereGeometry args={[0.62, 16, 12]} />
          <meshStandardMaterial color={shade(canopy, 1.14)} roughness={0.8} />
        </mesh>
        <mesh position={[-0.35, 0.55, 0.1]}>
          <sphereGeometry args={[0.45, 14, 12]} />
          <meshStandardMaterial color={shade(canopy, 1.14)} roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

/** Pink sakura tree, same shape family but blossom-coloured. */
export function SakuraTree(props: { position: [number, number, number]; scale?: number }) {
  return <Tree {...props} canopy="#ffc3df" />;
}

/** A soft rounded bush — clusters of green blobs, sometimes with berries. */
export function Bush({
  position,
  scale = 1,
  berries = false,
}: {
  position: [number, number, number];
  scale?: number;
  berries?: boolean;
}) {
  return (
    <group position={position} scale={scale}>
      {[
        [0, 0.35, 0, 0.45],
        [0.4, 0.3, 0.1, 0.34],
        [-0.35, 0.28, -0.1, 0.32],
        [0.1, 0.5, -0.2, 0.3],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 12, 10]} />
          <meshStandardMaterial color="#86d98a" roughness={0.9} />
        </mesh>
      ))}
      {berries &&
        [
          [0.2, 0.5, 0.2],
          [-0.2, 0.45, 0.1],
          [0.05, 0.6, -0.1],
        ].map((p, i) => (
          <mesh key={`b${i}`} position={p as [number, number, number]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#ff7aa8" emissive="#ff4f86" emissiveIntensity={0.2} />
          </mesh>
        ))}
    </group>
  );
}

/** Tiny red-cap mushroom, a little forest accent. */
export function Mushroom({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {/* stalk */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.1, 0.13, 0.34, 10]} />
        <meshStandardMaterial color="#fff4e6" roughness={0.9} />
      </mesh>
      {/* rounded red cap */}
      <mesh castShadow position={[0, 0.34, 0]}>
        <sphereGeometry args={[0.22, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color="#ff7a90" roughness={0.6} />
      </mesh>
      {/* white polka dots */}
      {[
        [0.1, 0.4, 0.08],
        [-0.1, 0.42, 0.02],
        [0.04, 0.46, -0.1],
        [-0.08, 0.39, -0.08],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#fffaf2" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}
