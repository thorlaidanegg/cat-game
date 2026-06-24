import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { useGame } from "../../store/useGame";
import { carRuntime, aiCar, type CarRT } from "../carRuntime";
import { resetRace } from "../raceLogic";

/**
 * The cute open-top race car. It only *renders* — physics live elsewhere
 * (player car in the Cat controller, AI car in CompanionCat). Pass a runtime +
 * colour to render either car. The player car (interactive) starts the race on
 * click.
 */
export default function Car({
  rt = carRuntime,
  color = "#ff6f91",
  interactive = true,
}: {
  rt?: CarRT;
  color?: string;
  interactive?: boolean;
}) {
  const g = useRef<Group>(null);
  const steerGroups = useRef<(Group | null)[]>([]);
  const hubs = useRef<(Group | null)[]>([]);

  useFrame(() => {
    if (g.current) {
      g.current.position.set(rt.pos.x, 0.42 + rt.y, rt.pos.z);
      g.current.rotation.set(-rt.vy * 0.015, rt.heading, -rt.steer * 0.05, "YXZ");
    }
    steerGroups.current.forEach((s) => s && (s.rotation.y = rt.steer * 0.5));
    hubs.current.forEach((h) => h && (h.rotation.x = rt.wheelSpin));
  });

  const startRace = () => {
    if (useGame.getState().riding) return;
    resetRace();
    useGame.getState().startRace();
  };

  const wheels: [number, number, boolean][] = [
    [-0.5, 0.62, true],
    [0.5, 0.62, true],
    [-0.5, -0.62, false],
    [0.5, -0.62, false],
  ];

  return (
    <group
      ref={g}
      scale={1.35}
      onClick={
        interactive
          ? (e) => {
              e.stopPropagation();
              startRace();
            }
          : undefined
      }
      onPointerOver={interactive ? () => (document.body.style.cursor = "pointer") : undefined}
      onPointerOut={interactive ? () => (document.body.style.cursor = "auto") : undefined}
    >
      {/* chassis */}
      <mesh castShadow position={[0, 0.18, 0]}>
        <boxGeometry args={[0.92, 0.28, 1.7]} />
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.2} />
      </mesh>
      <mesh castShadow position={[0, 0.18, 0.85]}>
        <sphereGeometry args={[0.46, 16, 12]} />
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.2} />
      </mesh>
      {/* cockpit */}
      <mesh position={[0, 0.34, -0.15]}>
        <boxGeometry args={[0.62, 0.2, 0.7]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
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
        <group key={i} position={[x, 0, z]} ref={(el) => front && (steerGroups.current[i] = el)}>
          <group ref={(el) => (hubs.current[i] = el)}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.27, 0.27, 0.2, 16]} />
              <meshStandardMaterial color="#4a3b44" roughness={0.8} />
            </mesh>
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
