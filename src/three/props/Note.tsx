import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { useGame } from "../../store/useGame";

/**
 * A little folded paper note resting in the grass. Clicking it opens love
 * note #`index` and awards a heart (the first time it's read).
 */
export default function Note({
  position,
  index,
}: {
  position: [number, number, number];
  index: number;
}) {
  const g = useRef<Group>(null);
  const read = useGame((s) => s.notesRead.includes(index));

  useFrame((state) => {
    if (g.current) g.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + index) * 0.05 + 0.15;
  });

  return (
    <group
      ref={g}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        useGame.getState().openNote(index);
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      {/* folded paper */}
      <mesh castShadow rotation={[-0.3, index, 0]}>
        <boxGeometry args={[0.5, 0.02, 0.6]} />
        <meshStandardMaterial color={read ? "#f0d6e6" : "#fffefb"} roughness={0.8} />
      </mesh>
      {/* a tiny heart so they're easy to spot */}
      <mesh position={[0, 0.28, 0]} scale={0.18}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial
          color="#ff7aa8"
          emissive="#ff4f86"
          emissiveIntensity={read ? 0.1 : 0.6}
        />
      </mesh>
    </group>
  );
}
