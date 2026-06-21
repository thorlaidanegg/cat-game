import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils, PointLight } from "three";
import { useGame } from "../../store/useGame";

/**
 * The glowing centerpiece of the Heart Garden. It pulses gently, and brightens
 * dramatically once the ending begins. Heart-shaped leaves orbit the canopy.
 */
export default function HeartTree({ position }: { position: [number, number, number] }) {
  const glow = useRef<PointLight>(null);
  const canopy = useRef<Group>(null);

  useFrame((state, delta) => {
    const ending = useGame.getState().phase === "ending";
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
    if (glow.current) {
      glow.current.intensity = MathUtils.lerp(glow.current.intensity, (ending ? 4 : 1.6) * pulse, 0.05);
    }
    if (canopy.current) canopy.current.rotation.y += delta * 0.3;
  });

  return (
    <group position={position}>
      {/* trunk */}
      <mesh castShadow position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.4, 0.6, 2.8, 10]} />
        <meshStandardMaterial color="#9c6f50" roughness={0.95} />
      </mesh>

      {/* glowing canopy */}
      <group ref={canopy} position={[0, 3.4, 0]}>
        <mesh castShadow>
          <icosahedronGeometry args={[1.8, 1]} />
          <meshStandardMaterial color="#ffc3df" emissive="#ff7aa8" emissiveIntensity={0.5} flatShading />
        </mesh>
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 2.1, Math.sin(a * 2) * 0.6, Math.sin(a) * 2.1]} scale={0.22}>
              <sphereGeometry args={[1, 8, 8]} />
              <meshStandardMaterial color="#ff7aa8" emissive="#ff4f86" emissiveIntensity={0.8} />
            </mesh>
          );
        })}
      </group>

      <pointLight ref={glow} position={[0, 3.4, 0]} color="#ff9ec2" distance={20} intensity={1.6} />

      {/* soft ring of grass glow on the ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.5, 4, 40]} />
        <meshBasicMaterial color="#ffd9e8" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}
