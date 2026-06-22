import { SUPPORTS } from "../platforms";

/**
 * A big, cute two-storey playhouse the cat can walk into and climb:
 *  - open ground floor with a cozy rug + furniture
 *  - a ramp up to an open roof terrace (with railings)
 *  - a little loft room in the back corner with its own pitched roof,
 *    reached by a second ramp
 *
 * Floors + ramps are rendered straight from `SUPPORTS` so what you see is
 * exactly what you can stand on. Everything else here is decoration.
 */
const L1 = 3.2;
const L2 = 6.4;
const WALL = "#fff0e0";
const WALL2 = "#ffe2cf";
const WOOD = "#d9a679";
const RAIL = "#a9d8ff";
const ROOF = "#ff8fb0";

export default function House() {
  return (
    <group>
      {/* ---- walkable floors + ramps (from SUPPORTS) ---- */}
      {SUPPORTS.map((s, i) => {
        if (s.kind === "slab") {
          return (
            <mesh key={i} position={[s.cx, s.top - 0.15, s.cz]} receiveShadow castShadow>
              <boxGeometry args={[s.w, 0.3, s.d]} />
              <meshStandardMaterial color={WOOD} roughness={0.9} />
            </mesh>
          );
        }
        // ramp: tilt a slab so it climbs along Z (high at zmin)
        const rise = (s.topAtZmin ?? 0) - (s.topAtZmax ?? 0);
        const len = Math.hypot(s.d, rise);
        const pitch = Math.atan2(rise, s.d);
        const midY = ((s.topAtZmin ?? 0) + (s.topAtZmax ?? 0)) / 2 - 0.08;
        return (
          <group key={i}>
            <mesh position={[s.cx, midY, s.cz]} rotation={[pitch, 0, 0]} receiveShadow castShadow>
              <boxGeometry args={[s.w, 0.22, len]} />
              <meshStandardMaterial color="#e9b98c" roughness={0.85} />
            </mesh>
            {/* ramp side rails */}
            {[-s.w / 2 + 0.1, s.w / 2 - 0.1].map((dx) => (
              <mesh key={dx} position={[s.cx + dx, midY + 0.45, s.cz]} rotation={[pitch, 0, 0]}>
                <boxGeometry args={[0.1, 0.5, len]} />
                <meshStandardMaterial color={RAIL} roughness={0.7} />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* ---- ground-floor walls (x[-5,5] z[-12,-2]) ---- */}
      {/* back wall with two windows */}
      <mesh position={[0, L1 / 2, -12]} castShadow receiveShadow>
        <boxGeometry args={[10, L1, 0.3]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>
      {[-2.5, 2.5].map((x) => (
        <mesh key={x} position={[x, L1 * 0.6, -11.82]}>
          <boxGeometry args={[1.6, 1.3, 0.08]} />
          <meshStandardMaterial color="#bfe6ff" emissive="#bfe6ff" emissiveIntensity={0.15} />
        </mesh>
      ))}
      {/* side walls */}
      {[-5, 5].map((x) => (
        <mesh key={x} position={[x, L1 / 2, -7]} castShadow receiveShadow>
          <boxGeometry args={[0.3, L1, 10]} />
          <meshStandardMaterial color={WALL2} roughness={0.95} />
        </mesh>
      ))}
      {/* front corner posts (entrance stays open) */}
      {[-5, 5].map((x) => (
        <mesh key={x} position={[x, L1 / 2, -2]} castShadow>
          <boxGeometry args={[0.45, L1, 0.45]} />
          <meshStandardMaterial color={WOOD} roughness={0.9} />
        </mesh>
      ))}
      {/* front header beam + a heart sign */}
      <mesh position={[0, L1 - 0.15, -2]} castShadow>
        <boxGeometry args={[10, 0.4, 0.4]} />
        <meshStandardMaterial color={WOOD} roughness={0.9} />
      </mesh>
      <mesh position={[0, L1 - 0.15, -1.7]} scale={0.5}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial color="#ff7aa8" emissive="#ff4f86" emissiveIntensity={0.4} />
      </mesh>

      {/* ---- terrace railings around the first floor (open front gap for ramp) ---- */}
      {/* front edge z=-2, split around the ramp opening */}
      {[
        [-3.4, 2.6],
        [3.4, 2.6],
      ].map(([x, w], i) => (
        <Rail key={`f${i}`} x={x} z={-2} w={w} depth={0.12} />
      ))}
      {/* side edges */}
      <Rail x={-5} z={-7} w={0.12} depth={10} />
      <Rail x={5} z={-7} w={0.12} depth={10} />

      {/* ---- loft room (x[-5,0] z[-12,-7]) on the first floor ---- */}
      {/* loft walls L1..L2 */}
      <mesh position={[-2.5, (L1 + L2) / 2, -12]} castShadow>
        <boxGeometry args={[5, L2 - L1, 0.25]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>
      <mesh position={[-5, (L1 + L2) / 2, -9.5]} castShadow>
        <boxGeometry args={[0.25, L2 - L1, 5]} />
        <meshStandardMaterial color={WALL2} roughness={0.95} />
      </mesh>
      {/* loft front wall (z=-7) with a doorway gap toward the ramp side */}
      <mesh position={[-3.7, (L1 + L2) / 2, -7]} castShadow>
        <boxGeometry args={[2.6, L2 - L1, 0.25]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>
      {/* loft window on the right wall */}
      <mesh position={[0, (L1 + L2) / 2 + 0.3, -9.5]} castShadow>
        <boxGeometry args={[0.25, L2 - L1, 5]} />
        <meshStandardMaterial color={WALL2} roughness={0.95} />
      </mesh>
      <mesh position={[0.14, L1 + 1.5, -9.5]}>
        <boxGeometry args={[0.08, 1.2, 2]} />
        <meshStandardMaterial color="#bfe6ff" emissive="#bfe6ff" emissiveIntensity={0.15} />
      </mesh>

      {/* loft pitched roof */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[-2.5 + s * 1.25, L2 + 0.9, -9.5]} rotation={[0, 0, s * 0.7]} castShadow>
          <boxGeometry args={[3.4, 0.25, 5.4]} />
          <meshStandardMaterial color={ROOF} roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[-2.5, L2 + 1.55, -9.5]}>
        <boxGeometry args={[0.3, 0.3, 5.4]} />
        <meshStandardMaterial color="#ff6f91" />
      </mesh>

      {/* ---- cozy ground-floor furniture ---- */}
      {/* rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -7]} receiveShadow>
        <circleGeometry args={[2.6, 32]} />
        <meshStandardMaterial color="#ffd0e2" roughness={0.95} />
      </mesh>
      {/* little table */}
      <mesh position={[0, 0.5, -8]} castShadow>
        <cylinderGeometry args={[0.7, 0.7, 0.15, 16]} />
        <meshStandardMaterial color={WOOD} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.25, -8]}>
        <cylinderGeometry args={[0.12, 0.12, 0.5, 8]} />
        <meshStandardMaterial color={WOOD} roughness={0.9} />
      </mesh>
      {/* cushions */}
      {[
        [-1.5, -6],
        [1.5, -6.4],
        [-1.2, -8.6],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]} castShadow>
          <boxGeometry args={[0.9, 0.3, 0.9]} />
          <meshStandardMaterial color={i % 2 ? "#b6e3ff" : "#ffb3d1"} roughness={0.9} />
        </mesh>
      ))}
      {/* a tiny potted plant in the loft */}
      <mesh position={[-4, L2 + 0.25, -11]} castShadow>
        <cylinderGeometry args={[0.22, 0.18, 0.4, 10]} />
        <meshStandardMaterial color="#ff9ec2" />
      </mesh>
      <mesh position={[-4, L2 + 0.7, -11]}>
        <icosahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color="#9be88f" flatShading />
      </mesh>
    </group>
  );
}

/** A simple terrace railing: a top rail on two little posts. */
function Rail({ x, z, w, depth }: { x: number; z: number; w: number; depth: number }) {
  return (
    <group position={[x, L1, z]}>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[Math.max(w, 0.08), 0.1, Math.max(depth, 0.08)]} />
        <meshStandardMaterial color={RAIL} roughness={0.7} />
      </mesh>
    </group>
  );
}
