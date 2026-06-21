import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { useGame } from "../../store/useGame";
import { carRuntime } from "../carRuntime";

/**
 * The cute open-top race car. It only *renders* — all driving physics live in
 * the Cat controller (which also seats the cat on top). Parked at the start line
 * until clicked. Wheels: an outer group steers (front only), an inner hub spins,
 * and the cylinder is oriented so its axle points left-right.
 */
export default function Car() {
  const g = useRef<Group>(null);
  const steerGroups = useRef<(Group | null)[]>([]); // front wheels (yaw)
  const hubs = useRef<(Group | null)[]>([]); // all wheels (roll)

  useFrame(() => {
    const c = carRuntime;
    if (g.current) {
      g.current.position.set(c.pos.x, 0.42, c.pos.z);
      g.current.rotation.set(0, c.heading, -c.steer * 0.05);
    }
    steerGroups.current.forEach((s) => s && (s.rotation.y = c.steer * 0.5));
    hubs.current.forEach((h) => h && (h.rotation.x = c.wheelSpin));
  });

  const startRace = () => {
    if (useGame.getState().riding) return;
    carRuntime.reset();
    useGame.getState().startRace();
  };

  const wheels: [number, number, boolean][] = [
    [-0.5, 0.62, true], // front-left
    [0.5, 0.62, true], // front-right
    [-0.5, -0.62, false], // rear-left
    [0.5, -0.62, false], // rear-right
  ];

  return (
    <group
      ref={g}
      scale={1.35}
      onClick={(e) => {
        e.stopPropagation();
        startRace();
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      {/* chassis */}
      <mesh castShadow position={[0, 0.18, 0]}>
        <boxGeometry args={[0.92, 0.28, 1.7]} />
        <meshStandardMaterial color="#ff6f91" roughness={0.45} metalness={0.2} />
      </mesh>
      <mesh castShadow position={[0, 0.18, 0.85]}>
        <sphereGeometry args={[0.46, 16, 12]} />
        <meshStandardMaterial color="#ff6f91" roughness={0.45} metalness={0.2} />
      </mesh>
      {/* cockpit */}
      <mesh position={[0, 0.34, -0.15]}>
        <boxGeometry args={[0.62, 0.2, 0.7]} />
        <meshStandardMaterial color="#ffd9e8" roughness={0.6} />
      </mesh>
      {/* spoiler */}
      <mesh castShadow position={[0, 0.52, -0.85]}>
        <boxGeometry args={[0.82, 0.05, 0.25]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      {[-0.42, 0.42].map((x) => (
        <mesh key={x} position={[x, 0.44, -0.85]}>
          <boxGeometry args={[0.05, 0.18, 0.08]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
      {/* heart on the hood */}
      <mesh position={[0, 0.33, 0.98]} scale={0.12}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color="#fff" emissive="#ff4f86" emissiveIntensity={0.4} />
      </mesh>

      {/* wheels */}
      {wheels.map(([x, z, front], i) => (
        <group
          key={i}
          position={[x, 0, z]}
          ref={(el) => front && (steerGroups.current[i] = el)}
        >
          <group ref={(el) => (hubs.current[i] = el)}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.27, 0.27, 0.2, 16]} />
              <meshStandardMaterial color="#4a3b44" roughness={0.8} />
            </mesh>
            {/* hubcap so the spin is visible */}
            <mesh position={[x > 0 ? 0.11 : -0.11, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.12, 0.12, 0.02, 12]} />
              <meshStandardMaterial color="#ffd9e8" />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}
