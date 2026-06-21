import { WORLD_RADIUS } from "./layout";

/**
 * The island the world sits on: one clean grassy disc on a rounded earthy
 * skirt. (We deliberately avoid stacking translucent "area pads" on top — those
 * were coplanar with the grass and caused z-fighting flicker.)
 */
export default function Ground() {
  return (
    <group>
      {/* main grass disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[WORLD_RADIUS + 6, 96]} />
        <meshStandardMaterial color="#a6e39c" roughness={1} />
      </mesh>

      {/* earthy "skirt" for thickness. Open-ended (no top cap) and dropped
          below the grass so its surface never coincides with it → no z-fight. */}
      <mesh position={[0, -2.3, 0]}>
        <cylinderGeometry args={[WORLD_RADIUS + 5.5, WORLD_RADIUS - 8, 4.4, 96, 1, true]} />
        <meshStandardMaterial color="#caa97e" roughness={1} side={2} />
      </mesh>
    </group>
  );
}
