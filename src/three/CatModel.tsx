import { MutableRefObject, ReactNode, RefObject } from "react";
import { Group, Mesh } from "three";

export interface CatColors {
  fur: string;
  furSoft: string;
  belly: string;
  pink: string;
  cheek: string;
  eye?: string;
}

export interface CatParts {
  head: RefObject<Group>;
  tail: RefObject<Group>;
  earL: RefObject<Mesh>;
  earR: RefObject<Mesh>;
  lidL: RefObject<Mesh>;
  lidR: RefObject<Mesh>;
  legs: MutableRefObject<(Mesh | null)[]>;
}

/**
 * The shared cute cat geometry (everything that lives inside the "rig" group).
 * Both the player cat and the companion NPC render this with different colours
 * so they look like a matching pair. Animation is driven externally via `parts`.
 */
export default function CatModel({
  colors,
  parts,
  accessory,
}: {
  colors: CatColors;
  parts: CatParts;
  accessory?: ReactNode;
}) {
  const { fur, furSoft, belly, pink, cheek } = colors;
  const eye = colors.eye ?? "#3a2b33";

  return (
    <>
      {/* chunky rounded body */}
      <mesh castShadow position={[0, 0.55, 0]} scale={[1, 0.92, 1.2]}>
        <sphereGeometry args={[0.6, 28, 24]} />
        <meshStandardMaterial color={fur} roughness={0.9} />
      </mesh>
      {/* soft belly patch */}
      <mesh position={[0, 0.4, 0.35]} scale={[0.78, 0.82, 0.7]}>
        <sphereGeometry args={[0.5, 24, 20]} />
        <meshStandardMaterial color={belly} roughness={0.95} />
      </mesh>

      {/* fat fluffy tail (two segments) */}
      <group ref={parts.tail} position={[0, 0.6, -0.62]}>
        <mesh castShadow position={[0, 0.25, -0.2]} rotation={[-0.5, 0, 0]}>
          <capsuleGeometry args={[0.16, 0.5, 8, 12]} />
          <meshStandardMaterial color={furSoft} roughness={0.9} />
        </mesh>
        <mesh castShadow position={[0, 0.6, -0.28]}>
          <sphereGeometry args={[0.19, 16, 14]} />
          <meshStandardMaterial color={fur} roughness={0.9} />
        </mesh>
      </group>

      {/* stubby little legs */}
      {[
        [-0.28, 0.34],
        [0.28, 0.34],
        [-0.28, -0.3],
        [0.28, -0.3],
      ].map(([x, z], i) => (
        <mesh key={i} ref={(m) => (parts.legs.current[i] = m)} castShadow position={[x, 0.18, z]}>
          <capsuleGeometry args={[0.16, 0.12, 6, 10]} />
          <meshStandardMaterial color={furSoft} roughness={0.9} />
        </mesh>
      ))}

      {/* optional accessory (bow tie, etc.) attached to the chest */}
      {accessory}

      {/* BIG round head (chibi proportions) */}
      <group ref={parts.head} position={[0, 1.05, 0.5]}>
        <mesh castShadow>
          <sphereGeometry args={[0.58, 28, 24]} />
          <meshStandardMaterial color={fur} roughness={0.9} />
        </mesh>

        {/* big rounded ears with pink inner */}
        <mesh ref={parts.earL} position={[-0.34, 0.46, -0.02]} rotation={[0, 0, 0.35]}>
          <coneGeometry args={[0.22, 0.4, 16]} />
          <meshStandardMaterial color={fur} roughness={0.9} />
        </mesh>
        <mesh ref={parts.earR} position={[0.34, 0.46, -0.02]} rotation={[0, 0, -0.35]}>
          <coneGeometry args={[0.22, 0.4, 16]} />
          <meshStandardMaterial color={fur} roughness={0.9} />
        </mesh>
        <mesh position={[-0.34, 0.44, 0.06]} rotation={[0, 0, 0.35]} scale={0.62}>
          <coneGeometry args={[0.22, 0.4, 16]} />
          <meshStandardMaterial color={pink} roughness={0.9} />
        </mesh>
        <mesh position={[0.34, 0.44, 0.06]} rotation={[0, 0, -0.35]} scale={0.62}>
          <coneGeometry args={[0.22, 0.4, 16]} />
          <meshStandardMaterial color={pink} roughness={0.9} />
        </mesh>

        {/* big sparkly eyes */}
        {[-0.22, 0.22].map((x, i) => (
          <group key={i} position={[x, 0.05, 0.46]}>
            <mesh scale={[0.85, 1.15, 0.7]}>
              <sphereGeometry args={[0.15, 20, 20]} />
              <meshStandardMaterial color={eye} roughness={0.25} />
            </mesh>
            <mesh position={[0.05, 0.06, 0.1]}>
              <sphereGeometry args={[0.05, 10, 10]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[-0.03, -0.04, 0.11]}>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
            </mesh>
            <mesh ref={i === 0 ? parts.lidL : parts.lidR} position={[0, 0.04, 0.05]} scale={[1, 0, 1]}>
              <sphereGeometry args={[0.17, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={fur} roughness={0.9} />
            </mesh>
          </group>
        ))}

        {/* rosy blush cheeks */}
        {[-0.34, 0.34].map((x) => (
          <mesh key={x} position={[x, -0.12, 0.4]} scale={[1, 0.7, 0.4]}>
            <sphereGeometry args={[0.12, 14, 12]} />
            <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.85} />
          </mesh>
        ))}

        {/* tiny nose + smile */}
        <mesh position={[0, -0.04, 0.57]}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial color={pink} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.14, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.05, 0.012, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#a8788a" />
        </mesh>

        {/* whiskers */}
        {[-1, 1].map((s) =>
          [-0.05, 0.05].map((yy) => (
            <mesh
              key={`${s}-${yy}`}
              position={[s * 0.52, yy - 0.04, 0.42]}
              rotation={[0, 0, s * (Math.PI / 2) + yy]}
            >
              <cylinderGeometry args={[0.004, 0.004, 0.32, 4]} />
              <meshStandardMaterial color="#e8d8cc" />
            </mesh>
          ))
        )}
      </group>
    </>
  );
}
