import { Vector3 } from "three";
import { SUPPORTS, L1, L2 } from "../platforms";
import { slideRuntime } from "../slideRuntime";
import { useGame } from "../../store/useGame";

/**
 * One big connected multi-storey playhouse + adventure course:
 *  - open ground room you walk into
 *  - front ramp up to Deck 1 (terrace)
 *  - an easy ramp to the Deck 2 loft, OR an obstacle run of floating
 *    stepping-stones you must JUMP across to the crow's-nest
 *  - three slides to whoosh back down from the top decks
 *
 * Walkable floors/ramps/stones are rendered straight from SUPPORTS so the
 * geometry matches exactly what the cat can stand on.
 */
const WALL = "#fff0e0";
const WALL2 = "#ffe2cf";
const WOOD = "#d9a679";
const RAIL = "#a9d8ff";
const ROOF = "#ff8fb0";
const STONE = ["#ffd36e", "#b6e3a1", "#d6a8ff"];

interface SlideDef {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
}
const SLIDES: SlideDef[] = [
  { from: [13, L2 + 0.2, -6.5], to: [20, 0.4, -3], color: "#7fd7ff" }, // off the crow's-nest
  { from: [-3.5, L2 + 0.2, -12.5], to: [-3.5, 0.4, -17.5], color: "#ffb3d1" }, // off the loft
  { from: [5.5, L1 + 0.2, -3.5], to: [9.5, 0.4, 1.5], color: "#b6e3a1" }, // off Deck 1
];

export default function MegaPlayhouse() {
  return (
    <group>
      {/* ---- walkable floors / ramps / stones (from SUPPORTS) ---- */}
      {SUPPORTS.map((s, i) => {
        if (s.kind === "ramp") {
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
              {[-s.w / 2 + 0.1, s.w / 2 - 0.1].map((dx) => (
                <mesh key={dx} position={[s.cx + dx, midY + 0.45, s.cz]} rotation={[pitch, 0, 0]}>
                  <boxGeometry args={[0.1, 0.5, len]} />
                  <meshStandardMaterial color={RAIL} roughness={0.7} />
                </mesh>
              ))}
            </group>
          );
        }
        const stone = s.w <= 2.2;
        return (
          <group key={i}>
            <mesh position={[s.cx, s.top - 0.15, s.cz]} receiveShadow castShadow>
              <boxGeometry args={[s.w, 0.3, s.d]} />
              <meshStandardMaterial color={stone ? STONE[i % STONE.length] : WOOD} roughness={0.9} />
            </mesh>
            {/* support poles */}
            {stone ? (
              <mesh position={[s.cx, (s.top - 0.3) / 2, s.cz]}>
                <cylinderGeometry args={[0.12, 0.12, s.top - 0.3, 8]} />
                <meshStandardMaterial color="#c89b78" />
              </mesh>
            ) : (
              [
                [-s.w / 2 + 0.4, -s.d / 2 + 0.4],
                [s.w / 2 - 0.4, -s.d / 2 + 0.4],
                [-s.w / 2 + 0.4, s.d / 2 - 0.4],
                [s.w / 2 - 0.4, s.d / 2 - 0.4],
              ].map(([dx, dz], k) => (
                <mesh key={k} position={[s.cx + dx, (s.top - 0.3) / 2, s.cz + dz]} castShadow>
                  <boxGeometry args={[0.4, s.top - 0.3, 0.4]} />
                  <meshStandardMaterial color={WOOD} roughness={0.9} />
                </mesh>
              ))
            )}
          </group>
        );
      })}

      {/* ---- ground room walls (under Deck 1: x[-6,6] z[-13,-3]) ---- */}
      <mesh position={[0, L1 / 2, -13]} castShadow receiveShadow>
        <boxGeometry args={[12, L1, 0.3]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>
      {[-3, 3].map((x) => (
        <mesh key={x} position={[x, L1 * 0.6, -12.82]}>
          <boxGeometry args={[1.8, 1.3, 0.08]} />
          <meshStandardMaterial color="#bfe6ff" emissive="#bfe6ff" emissiveIntensity={0.15} />
        </mesh>
      ))}
      {[-6, 6].map((x) => (
        <mesh key={x} position={[x, L1 / 2, -8]} castShadow receiveShadow>
          <boxGeometry args={[0.3, L1, 10]} />
          <meshStandardMaterial color={WALL2} roughness={0.95} />
        </mesh>
      ))}
      {/* entrance header + heart sign */}
      <mesh position={[0, L1 - 0.15, -3]} castShadow>
        <boxGeometry args={[12, 0.4, 0.4]} />
        <meshStandardMaterial color={WOOD} roughness={0.9} />
      </mesh>
      <mesh position={[0, L1 - 0.15, -2.7]} scale={0.55}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial color="#ff7aa8" emissive="#ff4f86" emissiveIntensity={0.4} />
      </mesh>

      {/* ---- Deck 1 terrace railings (front gap for ramp, right gap for stones) ---- */}
      <Rail x={-4.4} z={-3} w={3} depth={0.12} />
      <Rail x={-6} z={-9} w={0.12} depth={8} />

      {/* ---- Deck 2 loft room (x[-6,-1] z[-13,-8]) ---- */}
      <mesh position={[-3.5, (L1 + L2) / 2, -13]} castShadow>
        <boxGeometry args={[5, L2 - L1, 0.25]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>
      <mesh position={[-6, (L1 + L2) / 2, -10.5]} castShadow>
        <boxGeometry args={[0.25, L2 - L1, 5]} />
        <meshStandardMaterial color={WALL2} roughness={0.95} />
      </mesh>
      <mesh position={[-1, (L1 + L2) / 2 + 0.4, -10.5]} castShadow>
        <boxGeometry args={[0.25, L2 - L1, 5]} />
        <meshStandardMaterial color={WALL2} roughness={0.95} />
      </mesh>
      {/* loft pitched roof */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[-3.5 + s * 1.3, L2 + 0.9, -10.5]} rotation={[0, 0, s * 0.7]} castShadow>
          <boxGeometry args={[3.6, 0.25, 5.4]} />
          <meshStandardMaterial color={ROOF} roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[-3.5, L2 + 1.55, -10.5]}>
        <boxGeometry args={[0.3, 0.3, 5.4]} />
        <meshStandardMaterial color="#ff6f91" />
      </mesh>

      {/* crow's-nest little flag */}
      <mesh position={[13, L2 + 1.3, -8]}>
        <cylinderGeometry args={[0.06, 0.06, 1.8, 6]} />
        <meshStandardMaterial color={WOOD} />
      </mesh>
      <mesh position={[13.5, L2 + 1.7, -8]}>
        <boxGeometry args={[0.7, 0.45, 0.05]} />
        <meshStandardMaterial color="#ff7aa8" />
      </mesh>

      {/* ---- cozy ground-floor furniture ---- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -8]} receiveShadow>
        <circleGeometry args={[2.8, 32]} />
        <meshStandardMaterial color="#ffd0e2" roughness={0.95} />
      </mesh>
      {[
        [-1.6, -7],
        [1.6, -7.4],
        [-1.3, -9.6],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]} castShadow>
          <boxGeometry args={[0.9, 0.3, 0.9]} />
          <meshStandardMaterial color={i % 2 ? "#b6e3ff" : "#ffb3d1"} roughness={0.9} />
        </mesh>
      ))}

      {/* ---- slides down ---- */}
      {SLIDES.map((sl, i) => (
        <SlideChute key={i} {...sl} />
      ))}

      {/* a friendly arrow sign pointing to the obstacle run */}
      <mesh position={[3, L1 + 0.6, -8]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[1.2, 0.4, 0.06]} />
        <meshStandardMaterial color="#ffd36e" />
      </mesh>
    </group>
  );
}

/** A clickable slide chute the cat whooshes down (uses the slide-ride system). */
function SlideChute({ from, to, color }: SlideDef) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  const horiz = Math.hypot(dx, dz);
  const yaw = Math.atan2(dx, dz);
  const pitch = Math.atan2(-dy, horiz); // descending
  const length = Math.hypot(horiz, dy);
  const mid: [number, number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];

  const ride = (e: any) => {
    e.stopPropagation();
    if (useGame.getState().riding) return;
    slideRuntime.begin(new Vector3(...from), new Vector3(...to));
    useGame.getState().startSlide();
  };

  return (
    <group
      position={mid}
      rotation={[0, yaw, 0]}
      onClick={ride}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      <mesh rotation={[pitch, 0, 0]} castShadow>
        <boxGeometry args={[1.5, 0.14, length]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.12} />
      </mesh>
      {[-0.72, 0.72].map((x) => (
        <mesh key={x} position={[x, 0.2, 0]} rotation={[pitch, 0, 0]}>
          <boxGeometry args={[0.12, 0.34, length]} />
          <meshStandardMaterial color="#5cc8ff" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/** A simple terrace railing. */
function Rail({ x, z, w, depth }: { x: number; z: number; w: number; depth: number }) {
  return (
    <mesh position={[x, L1 + 0.55, z]}>
      <boxGeometry args={[Math.max(w, 0.08), 0.1, Math.max(depth, 0.08)]} />
      <meshStandardMaterial color={RAIL} roughness={0.7} />
    </mesh>
  );
}
