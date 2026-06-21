import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh } from "three";
import { useGame } from "../../store/useGame";
import { pickInteraction } from "../../data/messages";

/** A soft, gently rippling lake with lily pads and a couple of bobbing ducks. */
export default function Lake({ position }: { position: [number, number, number] }) {
  const water = useRef<Mesh>(null);
  // a barely-there breathing ripple keeps the surface alive without a render target
  useFrame((state) => {
    if (water.current) {
      const t = state.clock.elapsedTime;
      water.current.position.y = 0.05 + Math.sin(t * 0.8) * 0.015;
    }
  });

  return (
    <group position={position}>
      {/* sandy basin so the water reads as depth, not a flat sticker */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} receiveShadow>
        <circleGeometry args={[12.6, 48]} />
        <meshStandardMaterial color="#bfe0d0" roughness={1} />
      </mesh>
      {/* glassy water surface */}
      <mesh
        ref={water}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.05, 0]}
        onClick={(e) => {
          e.stopPropagation();
          useGame.getState().showMessage(pickInteraction("lake"));
        }}
      >
        <circleGeometry args={[12, 48]} />
        <meshStandardMaterial
          color="#a9dcff"
          roughness={0.15}
          metalness={0.3}
          transparent
          opacity={0.78}
        />
      </mesh>

      {/* lily pads */}
      {[
        [3, 0, 2],
        [-4, 0, -1],
        [1, 0, -4],
        [-2, 0, 3],
      ].map((p, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[p[0], 0.06, p[2]]}>
          <circleGeometry args={[0.6, 16]} />
          <meshStandardMaterial color="#7fce8c" roughness={0.8} />
        </mesh>
      ))}

      <Duck position={[2, 0.2, -2]} delay={0} />
      <Duck position={[-3, 0.2, 2]} delay={1.5} />
    </group>
  );
}

function Duck({ position, delay }: { position: [number, number, number]; delay: number }) {
  const g = useRef<Group>(null);
  useFrame((state) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime + delay;
    g.current.position.y = position[1] + Math.sin(t * 1.5) * 0.05;
    g.current.position.x = position[0] + Math.sin(t * 0.4) * 1.5;
    g.current.position.z = position[2] + Math.cos(t * 0.4) * 1.5;
    g.current.rotation.y = -t * 0.4;
  });
  return (
    <group ref={g} position={position}>
      <mesh castShadow>
        <sphereGeometry args={[0.3, 16, 14]} />
        <meshStandardMaterial color="#fff8e6" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.22, 0.2]}>
        <sphereGeometry args={[0.16, 14, 12]} />
        <meshStandardMaterial color="#fff8e6" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.22, 0.36]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.07, 0.16, 8]} />
        <meshStandardMaterial color="#ffb84d" />
      </mesh>
    </group>
  );
}
