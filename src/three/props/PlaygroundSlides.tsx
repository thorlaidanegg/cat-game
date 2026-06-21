import { Vector3 } from "three";
import { useGame } from "../../store/useGame";
import { slideRuntime } from "../slideRuntime";

/**
 * A big, climbable play tower with several slides radiating from the top.
 * Click any slide and the cat hops to the top and whooshes down it (the ride is
 * animated in the Cat controller via `slideRuntime`). Sized to dwarf the cat so
 * it reads as a real playground centrepiece.
 */
const TOWER_R = 1.7;
const H = 4.2; // platform height (local)
const RUN = 5.5; // how far each slide reaches out
const SCALE = 1.5;

// directions for the slides (radians). The remaining gap holds the ladder.
const SLIDE_ANGLES = [Math.PI * 0.15, Math.PI * 0.7, Math.PI * 1.15, Math.PI * 1.7];
const LADDER_ANGLE = Math.PI * 1.95;

const CHUTE_COLORS = ["#7fd7ff", "#ffb3d1", "#b6e3a1", "#ffd36e"];

export default function PlaygroundSlides({ position }: { position: [number, number, number] }) {
  const base = new Vector3(...position);

  // world top/bottom of a slide at angle a (accounts for the group scale)
  const topOf = (a: number) =>
    new Vector3(
      base.x + SCALE * TOWER_R * Math.cos(a),
      SCALE * (H - 0.2),
      base.z - SCALE * TOWER_R * Math.sin(a)
    );
  const bottomOf = (a: number) =>
    new Vector3(
      base.x + SCALE * (TOWER_R + RUN) * Math.cos(a),
      SCALE * 0.35,
      base.z - SCALE * (TOWER_R + RUN) * Math.sin(a)
    );

  const ride = (a: number) => {
    if (useGame.getState().riding) return;
    slideRuntime.begin(topOf(a), bottomOf(a));
    useGame.getState().startSlide();
  };

  return (
    <group position={position} scale={SCALE}>
      {/* central tower platform */}
      <mesh castShadow position={[0, H, 0]}>
        <cylinderGeometry args={[TOWER_R, TOWER_R, 0.3, 20]} />
        <meshStandardMaterial color="#ffd36e" roughness={0.7} />
      </mesh>
      {/* trunk / column */}
      <mesh castShadow position={[0, H / 2, 0]}>
        <cylinderGeometry args={[0.45, 0.6, H, 16]} />
        <meshStandardMaterial color="#ffb38a" roughness={0.85} />
      </mesh>
      {/* cute pointy roof */}
      <mesh castShadow position={[0, H + 1.1, 0]}>
        <coneGeometry args={[TOWER_R + 0.5, 1.6, 18]} />
        <meshStandardMaterial color="#ff7aa8" roughness={0.7} />
      </mesh>
      <mesh position={[0, H + 2.0, 0]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#fff" emissive="#ffd36e" emissiveIntensity={0.5} />
      </mesh>
      {/* railing posts around the platform */}
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * (TOWER_R - 0.1), H + 0.4, Math.sin(a) * (TOWER_R - 0.1)]}>
            <cylinderGeometry args={[0.05, 0.05, 0.7, 6]} />
            <meshStandardMaterial color="#a9d8ff" />
          </mesh>
        );
      })}

      {/* the slides */}
      {SLIDE_ANGLES.map((a, i) => {
        const dz = H - 0.35;
        const len = Math.hypot(RUN, dz);
        const pitch = Math.atan2(dz, RUN);
        const midR = TOWER_R + RUN / 2;
        const midY = (H + 0.35) / 2;
        return (
          <group
            key={i}
            rotation={[0, a, 0]}
            onClick={(e) => {
              e.stopPropagation();
              ride(a);
            }}
            onPointerOver={() => (document.body.style.cursor = "pointer")}
            onPointerOut={() => (document.body.style.cursor = "auto")}
          >
            {/* chute bed */}
            <mesh castShadow position={[midR, midY, 0]} rotation={[0, 0, -pitch]}>
              <boxGeometry args={[len, 0.14, 1.3]} />
              <meshStandardMaterial color={CHUTE_COLORS[i % CHUTE_COLORS.length]} roughness={0.35} metalness={0.12} />
            </mesh>
            {/* side rails */}
            {[-0.62, 0.62].map((z) => (
              <mesh key={z} position={[midR, midY + 0.2, z]} rotation={[0, 0, -pitch]}>
                <boxGeometry args={[len, 0.34, 0.12]} />
                <meshStandardMaterial color="#5cc8ff" roughness={0.5} />
              </mesh>
            ))}
            {/* a little lip at the bottom */}
            <mesh position={[TOWER_R + RUN + 0.2, 0.35, 0]} rotation={[0, 0, 0.5]}>
              <boxGeometry args={[0.9, 0.12, 1.3]} />
              <meshStandardMaterial color={CHUTE_COLORS[i % CHUTE_COLORS.length]} roughness={0.4} />
            </mesh>
          </group>
        );
      })}

      {/* climbing ladder */}
      <group rotation={[0, LADDER_ANGLE, 0]}>
        {[-0.45, 0.45].map((z) => (
          <mesh key={z} position={[TOWER_R + 0.2, H / 2, z]}>
            <cylinderGeometry args={[0.07, 0.07, H, 8]} />
            <meshStandardMaterial color="#d6a8ff" />
          </mesh>
        ))}
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i} position={[TOWER_R + 0.2, 0.4 + i * (H - 0.6) / 6, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.9, 6]} />
            <meshStandardMaterial color="#c08bff" />
          </mesh>
        ))}
      </group>
    </group>
  );
}
