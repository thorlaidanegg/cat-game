import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, Mesh, MeshStandardMaterial, Shape } from "three";
import { SUPPORTS, F2, F3, F4 } from "../platforms";
import { useGame } from "../../store/useGame";

/**
 * The Home — a big THREE-storey house both cats live in.
 *  Ground: living room (TV), detailed kitchen, bathroom, glass doors → pool.
 *  Floor 2: a cozy GIRLY room (window seat + cushions, bookshelf, lamp, bed).
 *  Floor 3: a BOY room (study desk, projector + screen, bookshelf) + a big
 *           balcony with a seating area.
 *  A wide open central staircase links them all.
 */
const WALL = "#fff3e6";
const WALL2 = "#ffe9d6";
const FLOORW = "#e7c9a3";
const TRIM = "#cf9a6c";
const ROOF = "#ff8fb0";
const GLASS = "#bfe6ff";
const TOP = F2 * 4; // 20, wall height (4 storeys)
const BACK = -42; // back wall z
const FRONT = -2; // open front z
const MIDZ = (BACK + FRONT) / 2; // -22, house depth centre
const DEPTH = FRONT - BACK; // 40

/* ============================================================= main */
export default function Home() {
  return (
    <group>
      <Floors />
      <Walls />
      <Staircase />
      <Roof />

      <LivingRoom />
      <Kitchen />
      <Bathroom />
      <GirlyRoom />
      <BoyRoom />
      <Balcony />
      <Pool />

      <Gym />
      <ExtraFurniture />

      {/* welcome mat + heart sign */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -2.6]}>
        <planeGeometry args={[3, 1.4]} />
        <meshStandardMaterial color="#ff9ec2" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ============================================================= structure */
function Slab({ s }: { s: (typeof SUPPORTS)[number] }) {
  return (
    <mesh position={[s.cx, s.top - 0.15, s.cz]} receiveShadow castShadow>
      <boxGeometry args={[s.w, 0.3, s.d]} />
      <meshStandardMaterial color={TRIM} roughness={0.9} />
    </mesh>
  );
}

function Floors() {
  return (
    <group>
      {/* ground wood floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, MIDZ]} receiveShadow>
        <planeGeometry args={[31.6, DEPTH - 0.4]} />
        <meshStandardMaterial color={FLOORW} roughness={0.85} />
      </mesh>
      {SUPPORTS.filter((s) => s.kind === "slab").map((s, i) => (
        <Slab key={i} s={s} />
      ))}
    </group>
  );
}

/** A framed window: solid frame around a glass pane, on a wall face. */
function Window({ x, y, z, rot = 0 }: { x: number; y: number; z: number; rot?: number }) {
  return (
    <group position={[x, y, z]} rotation={[0, rot, 0]}>
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[2.6, 2, 0.12]} />
        <meshStandardMaterial color={TRIM} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.11]}>
        <boxGeometry args={[2.2, 1.6, 0.06]} />
        <meshStandardMaterial color={GLASS} transparent opacity={0.35} roughness={0.1} metalness={0.2} emissive={GLASS} emissiveIntensity={0.06} />
      </mesh>
      {/* muntins */}
      <mesh position={[0, 0, 0.13]}>
        <boxGeometry args={[0.06, 1.6, 0.02]} />
        <meshStandardMaterial color={TRIM} />
      </mesh>
      <mesh position={[0, 0, 0.13]}>
        <boxGeometry args={[2.2, 0.06, 0.02]} />
        <meshStandardMaterial color={TRIM} />
      </mesh>
    </group>
  );
}

/**
 * Solid house shell (back + two sides + roof) with punched windows, and an OPEN
 * dollhouse front so you can see the cozy rooms inside. This reads as a real
 * home instead of see-through floating platforms.
 */
function Walls() {
  const floors = [1.6, F2 + 1.6, F3 + 1.6, F4 + 1.6]; // window heights per storey
  return (
    <group>
      {/* solid back wall */}
      <mesh position={[0, TOP / 2, BACK]} castShadow receiveShadow>
        <boxGeometry args={[32, TOP, 0.4]} />
        <meshStandardMaterial color={WALL} roughness={0.97} />
      </mesh>
      {floors.map((y) =>
        [-10, -3.5, 3.5, 10].map((x) => <Window key={`b${y}-${x}`} x={x} y={y} z={BACK + 0.25} />)
      )}
      {/* solid side walls */}
      {[-16, 16].map((sx) => (
        <group key={sx}>
          <mesh position={[sx, TOP / 2, MIDZ]} castShadow receiveShadow>
            <boxGeometry args={[0.4, TOP, DEPTH]} />
            <meshStandardMaterial color={WALL2} roughness={0.97} />
          </mesh>
          {floors.map((y) =>
            [-37, -30, -23, -10].map((z) => (
              <Window key={`s${sx}-${y}-${z}`} x={sx - Math.sign(sx) * 0.22} y={y} z={z} rot={Math.PI / 2} />
            ))
          )}
        </group>
      ))}
      {/* front: corner columns + eave beam, otherwise open to reveal the interior */}
      {[-16, 16].map((x) => (
        <mesh key={x} position={[x, TOP / 2, FRONT]} castShadow>
          <boxGeometry args={[0.6, TOP, 0.6]} />
          <meshStandardMaterial color={TRIM} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, TOP - 0.3, FRONT]} castShadow>
        <boxGeometry args={[32, 0.6, 0.6]} />
        <meshStandardMaterial color={TRIM} roughness={0.9} />
      </mesh>
      {/* thin floor-edge fascia on each storey front so slabs read as floors */}
      {[F2, F3, F4].map((y) => (
        <mesh key={y} position={[0, y - 0.15, FRONT]}>
          <boxGeometry args={[32, 0.5, 0.4]} />
          <meshStandardMaterial color={WALL2} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Staircase() {
  const ramps = SUPPORTS.filter((s) => s.kind === "ramp");
  return (
    <group>
      {ramps.map((r, i) => {
        const rise = (r.topAtZmin ?? 0) - (r.topAtZmax ?? 0);
        const len = Math.hypot(r.d, rise);
        const pitch = Math.atan2(rise, r.d);
        const midY = ((r.topAtZmin ?? 0) + (r.topAtZmax ?? 0)) / 2 - 0.08;
        return (
          <group key={i}>
            {/* walkable ramp */}
            <mesh position={[r.cx, midY, r.cz]} rotation={[pitch, 0, 0]} receiveShadow castShadow>
              <boxGeometry args={[r.w, 0.25, len]} />
              <meshStandardMaterial color={FLOORW} roughness={0.85} />
            </mesh>
            {/* decorative step fronts */}
            {Array.from({ length: 10 }).map((_, k) => {
              const t = k / 10;
              const z = r.cz + r.d / 2 - t * r.d;
              const yTop = (r.topAtZmax ?? 0) + ((r.topAtZmin ?? 0) - (r.topAtZmax ?? 0)) * t;
              return (
                <mesh key={k} position={[r.cx, yTop - 0.15, z]}>
                  <boxGeometry args={[r.w, 0.3, 0.4]} />
                  <meshStandardMaterial color={TRIM} roughness={0.9} />
                </mesh>
              );
            })}
            {/* glass banisters on both open sides */}
            {[-r.w / 2, r.w / 2].map((dx) => (
              <mesh key={dx} position={[r.cx + dx, midY + 0.6, r.cz]} rotation={[pitch, 0, 0]}>
                <boxGeometry args={[0.08, 1.1, len]} />
                <meshStandardMaterial color={GLASS} transparent opacity={0.3} roughness={0.1} />
              </mesh>
            ))}
          </group>
        );
      })}
      {/* landing railings (glass) around the central stairwell openings */}
      {[-5, 5].map((x) => (
        <mesh key={x} position={[x, F3 + 0.6, -18]}>
          <boxGeometry args={[0.08, 1.1, 4]} />
          <meshStandardMaterial color={GLASS} transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Roof() {
  const HW = 17; // half-width incl. eave overhang
  const PEAK = 6; // ridge height above the eaves
  const rd = DEPTH + 0.6; // roof depth (slight overhang)

  // A solid gable prism: a triangle (apex UP) extruded front→back.
  const gable = useMemo(() => {
    const s = new Shape();
    s.moveTo(-HW, 0);
    s.lineTo(HW, 0);
    s.lineTo(0, PEAK);
    s.closePath();
    return s;
  }, []);

  return (
    <group>
      <mesh position={[0, TOP, BACK - 0.3]} castShadow receiveShadow>
        <extrudeGeometry args={[gable, { depth: rd, bevelEnabled: false }]} />
        <meshStandardMaterial color={ROOF} roughness={0.8} side={2} />
      </mesh>
      <mesh position={[0, TOP + PEAK, MIDZ]}>
        <boxGeometry args={[0.6, 0.4, rd]} />
        <meshStandardMaterial color="#ff6f91" />
      </mesh>
    </group>
  );
}

/* ============================================================= ground: living room */
function LivingRoom() {
  return (
    <group position={[-8, 0, -8]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <planeGeometry args={[10, 9]} />
        <meshStandardMaterial color="#ffd0e2" roughness={0.95} />
      </mesh>
      {/* L-sofa */}
      <mesh castShadow position={[-2, 0.45, 2]}>
        <boxGeometry args={[5, 0.6, 1.4]} />
        <meshStandardMaterial color="#b6c8ff" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[-4, 0.45, -0.5]}>
        <boxGeometry args={[1.4, 0.6, 4]} />
        <meshStandardMaterial color="#b6c8ff" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[-2, 0.95, 2.5]}>
        <boxGeometry args={[5, 0.9, 0.4]} />
        <meshStandardMaterial color="#a7bbff" roughness={0.9} />
      </mesh>
      {[-3.5, -1, 1.5].map((x) => (
        <mesh key={x} position={[x, 0.9, 1.8]}>
          <boxGeometry args={[0.9, 0.4, 0.9]} />
          <meshStandardMaterial color="#ff9ec2" roughness={0.9} />
        </mesh>
      ))}
      {/* coffee table */}
      <mesh castShadow position={[0, 0.4, 0]}>
        <boxGeometry args={[2, 0.2, 1.2]} />
        <meshStandardMaterial color={TRIM} roughness={0.8} />
      </mesh>
      <TV />
      {/* floor lamp */}
      <mesh position={[3, 1.3, -3]}>
        <cylinderGeometry args={[0.05, 0.09, 2.6, 8]} />
        <meshStandardMaterial color="#c89b78" />
      </mesh>
      <mesh position={[3, 2.7, -3]}>
        <coneGeometry args={[0.5, 0.7, 16]} />
        <meshStandardMaterial color="#fff3c0" emissive="#ffe082" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function TV() {
  const [on, setOn] = useState(false);
  const mat = useRef<MeshStandardMaterial>(null);
  const col = useRef(new Color());
  useFrame((state) => {
    if (!mat.current) return;
    if (on) {
      const t = state.clock.elapsedTime;
      col.current.setHSL((t * 0.1) % 1, 0.55, 0.6);
      mat.current.color.copy(col.current);
      mat.current.emissive.copy(col.current);
      mat.current.emissiveIntensity = 0.9;
    } else {
      mat.current.color.set("#26232b");
      mat.current.emissive.set("#000");
      mat.current.emissiveIntensity = 0;
    }
  });
  return (
    <group
      position={[0, 2, -4.2]}
      onClick={(e) => {
        e.stopPropagation();
        setOn((o) => !o);
        useGame.getState().showMessage(on ? "show's over 🐾" : "movie night, just us two 🍿❤️");
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      <mesh castShadow>
        <boxGeometry args={[4.6, 2.6, 0.2]} />
        <meshStandardMaterial color="#33303a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.12]}>
        <planeGeometry args={[4.3, 2.3]} />
        <meshStandardMaterial ref={mat} color="#26232b" />
      </mesh>
      {/* media console */}
      <mesh position={[0, -1.7, 0]} castShadow>
        <boxGeometry args={[5, 0.7, 0.6]} />
        <meshStandardMaterial color={TRIM} />
      </mesh>
    </group>
  );
}

/* ============================================================= ground: kitchen (detailed) */
function Kitchen() {
  return (
    <group position={[8, 0, -23]}>
      {/* counters along back + right */}
      <Counter x={0} z={-6} w={14} />
      <Counter x={6.5} z={0} w={11} rot={Math.PI / 2} />
      {/* upper cabinets */}
      <mesh position={[0, 2.6, -6.4]}>
        <boxGeometry args={[14, 1, 0.6]} />
        <meshStandardMaterial color="#ffe0c0" roughness={0.85} />
      </mesh>
      {/* stove + oven */}
      <mesh position={[-3, 1.08, -6]}>
        <boxGeometry args={[1.6, 0.06, 1]} />
        <meshStandardMaterial color="#3a3340" />
      </mesh>
      {[-0.4, 0.4].map((dx) => (
        <mesh key={dx} position={[-3 + dx, 1.12, -6]}>
          <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      ))}
      {/* range hood */}
      <mesh position={[-3, 2.3, -6.3]}>
        <boxGeometry args={[1.8, 0.6, 0.8]} />
        <meshStandardMaterial color="#e7e2ea" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* sink */}
      <mesh position={[3, 1.06, -6]}>
        <boxGeometry args={[1.1, 0.12, 0.8]} />
        <meshStandardMaterial color="#cfe8ff" metalness={0.3} roughness={0.2} />
      </mesh>
      <mesh position={[3, 1.4, -6.3]}>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
        <meshStandardMaterial color="#c8c8d0" metalness={0.6} roughness={0.2} />
      </mesh>
      {/* --- utensils & bits on the counter --- */}
      {/* pots hanging under the hood */}
      {[-3.6, -3, -2.4].map((x, i) => (
        <mesh key={i} position={[x, 1.9, -6]}>
          <cylinderGeometry args={[0.18, 0.16, 0.28, 12]} />
          <meshStandardMaterial color={["#ff9ec2", "#b6e3a1", "#7fd7ff"][i]} metalness={0.2} roughness={0.5} />
        </mesh>
      ))}
      {/* knife block */}
      <mesh position={[1, 1.25, -6]}>
        <boxGeometry args={[0.3, 0.35, 0.25]} />
        <meshStandardMaterial color={TRIM} />
      </mesh>
      {/* kettle */}
      <mesh position={[-1, 1.25, -6]}>
        <sphereGeometry args={[0.24, 12, 10]} />
        <meshStandardMaterial color="#ff7aa8" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* mug tree with mugs */}
      {[0, 0.5, 1].map((a, i) => (
        <mesh key={i} position={[5 + Math.cos(a * 6) * 0.2, 1.22, -5.6 + Math.sin(a * 6) * 0.2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.16, 10]} />
          <meshStandardMaterial color={["#fff", "#b6c8ff", "#ffd36e"][i]} />
        </mesh>
      ))}
      {/* island with stools + fruit bowl */}
      <mesh castShadow position={[-1, 0.5, 0]}>
        <boxGeometry args={[4, 1, 1.8]} />
        <meshStandardMaterial color="#fbeee0" roughness={0.7} />
      </mesh>
      <mesh position={[-1, 1.02, 0]}>
        <boxGeometry args={[4.1, 0.08, 1.9]} />
        <meshStandardMaterial color="#e7b3c8" roughness={0.5} />
      </mesh>
      <mesh position={[-1, 1.2, 0]}>
        <cylinderGeometry args={[0.4, 0.45, 0.2, 16]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      {[
        [0.15, 0.12, 0.1],
        [-0.15, 0.12, -0.1],
        [0, 0.12, 0.15],
      ].map((p, i) => (
        <mesh key={i} position={[-1 + p[0], 1.32, p[2]]}>
          <sphereGeometry args={[0.13, 10, 10]} />
          <meshStandardMaterial color={["#ff7a90", "#ffd36e", "#b6e3a1"][i]} />
        </mesh>
      ))}
      {[-2.5, -1, 0.5].map((x) => (
        <mesh key={x} position={[x, 0.7, 1.3]}>
          <cylinderGeometry args={[0.28, 0.28, 0.2, 12]} />
          <meshStandardMaterial color="#ff9ec2" />
        </mesh>
      ))}
      <Fridge />
    </group>
  );
}

function Counter({ x, z, w, rot = 0 }: { x: number; z: number; w: number; rot?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[w, 1, 1]} />
        <meshStandardMaterial color="#fbeee0" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <boxGeometry args={[w, 0.08, 1.05]} />
        <meshStandardMaterial color="#e7b3c8" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Fridge() {
  return (
    <group
      position={[6, 0, -5.4]}
      onClick={(e) => {
        e.stopPropagation();
        useGame.getState().showMessage("snack break? I saved you the last slice 🍰");
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      <mesh castShadow position={[0, 1.5, 0]}>
        <boxGeometry args={[1.4, 3, 1.3]} />
        <meshStandardMaterial color="#eaf2ff" roughness={0.4} metalness={0.2} />
      </mesh>
      {[2, 1].map((y) => (
        <mesh key={y} position={[-0.6, y, 0.66]}>
          <boxGeometry args={[0.1, 0.8, 0.08]} />
          <meshStandardMaterial color="#b6c8ff" />
        </mesh>
      ))}
    </group>
  );
}

/* ============================================================= ground: bathroom */
function Bathroom() {
  return (
    <group position={[-11, 0, -25]}>
      {/* partition walls */}
      <mesh position={[3, 1.5, 0]}>
        <boxGeometry args={[0.2, 3, 8]} />
        <meshStandardMaterial color={WALL2} roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.5, 4]}>
        <boxGeometry args={[6, 3, 0.2]} />
        <meshStandardMaterial color={WALL2} roughness={0.95} />
      </mesh>
      {/* bathtub */}
      <mesh castShadow position={[-1, 0.5, -1.5]}>
        <boxGeometry args={[3, 1, 1.6]} />
        <meshStandardMaterial color="#fff" roughness={0.4} />
      </mesh>
      <mesh position={[-1, 0.65, -1.5]}>
        <boxGeometry args={[2.6, 0.3, 1.2]} />
        <meshStandardMaterial color="#bfe6ff" transparent opacity={0.7} />
      </mesh>
      {/* toilet */}
      <mesh position={[1.8, 0.4, 1.8]}>
        <boxGeometry args={[0.8, 0.8, 0.9]} />
        <meshStandardMaterial color="#fff" roughness={0.4} />
      </mesh>
      {/* sink + round mirror */}
      <mesh position={[-2.5, 0.9, 2]}>
        <boxGeometry args={[1.2, 0.2, 0.7]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[-2.5, 1.9, 2.3]}>
        <cylinderGeometry args={[0.4, 0.4, 0.06, 20]} />
        <meshStandardMaterial color="#dff1ff" metalness={0.5} roughness={0.1} />
      </mesh>
      {/* washing machine (utility) */}
      <mesh castShadow position={[1.6, 0.6, -1.5]}>
        <boxGeometry args={[1.1, 1.2, 1.1]} />
        <meshStandardMaterial color="#f2f6ff" roughness={0.5} metalness={0.15} />
      </mesh>
      <mesh position={[1.6, 0.65, -0.96]}>
        <cylinderGeometry args={[0.35, 0.35, 0.08, 20]} />
        <meshStandardMaterial color="#9ec8ff" transparent opacity={0.6} metalness={0.3} roughness={0.1} />
      </mesh>
      {/* towel rail + towels */}
      <mesh position={[-3.4, 1.4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 1.4, 8]} />
        <meshStandardMaterial color="#c8c8d0" metalness={0.5} />
      </mesh>
      {[-0.3, 0.3].map((z) => (
        <mesh key={z} position={[-3.3, 1.05, z]}>
          <boxGeometry args={[0.1, 0.8, 0.4]} />
          <meshStandardMaterial color={z < 0 ? "#ff9ec2" : "#b6c8ff"} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/* ============================================================= floor 2: girly room */
function GirlyRoom() {
  return (
    <group position={[-8, F2, -22]}>
      {/* fluffy round rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.5, 0.02, 1]}>
        <circleGeometry args={[3.2, 32]} />
        <meshStandardMaterial color="#ffe0ee" roughness={0.95} />
      </mesh>

      {/* canopy bed with plushies */}
      <group position={[-3.5, 0, -4]}>
        <mesh castShadow position={[0, 0.4, 0]}>
          <boxGeometry args={[4, 0.6, 3]} />
          <meshStandardMaterial color="#ffc7de" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <boxGeometry args={[3.8, 0.3, 2.8]} />
          <meshStandardMaterial color="#fff6fb" />
        </mesh>
        <mesh position={[0, 0.9, 0.5]}>
          <boxGeometry args={[3.8, 0.18, 1.9]} />
          <meshStandardMaterial color="#ffd6e6" roughness={0.9} />
        </mesh>
        {[-1, 1].map((x) => (
          <mesh key={x} position={[x, 1.05, -1]}>
            <boxGeometry args={[1.4, 0.3, 0.7]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
        ))}
        {[
          [-1.8, -1.3],
          [1.8, -1.3],
          [-1.8, 1.3],
          [1.8, 1.3],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 1.6, z]}>
            <cylinderGeometry args={[0.06, 0.06, 3.2, 8]} />
            <meshStandardMaterial color="#ffb3d1" />
          </mesh>
        ))}
        <mesh position={[0, 3.2, 0]}>
          <boxGeometry args={[3.9, 0.15, 2.8]} />
          <meshStandardMaterial color="#ff9ec2" transparent opacity={0.5} />
        </mesh>
        <Teddy x={1.1} y={0.95} z={-0.7} color="#f0c8a0" />
      </group>

      {/* window seat with sunshine + cushions (left wall) */}
      <group position={[-7.4, 0, 3]}>
        <mesh castShadow position={[0, 0.4, 0]}>
          <boxGeometry args={[0.9, 0.8, 4.5]} />
          <meshStandardMaterial color="#ffe9d6" roughness={0.9} />
        </mesh>
        {[-1.4, 0, 1.4].map((z, i) => (
          <mesh key={z} position={[0, 0.9, z]}>
            <boxGeometry args={[0.75, 0.25, 1]} />
            <meshStandardMaterial color={["#ff9ec2", "#b6c8ff", "#ffd36e"][i]} roughness={0.9} />
          </mesh>
        ))}
        <pointLight position={[0.8, 1.6, 0]} color="#ffe6a8" intensity={0.7} distance={8} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.6, 0.06, 0]}>
          <planeGeometry args={[3, 4.4]} />
          <meshBasicMaterial color="#fff2c4" transparent opacity={0.35} />
        </mesh>
      </group>

      {/* big bookshelf against the right wall */}
      <Bookshelf x={7} z={-4.5} rot={Math.PI} colors={["#ff9ec2", "#ffd36e", "#b6e3a1", "#b6c8ff", "#d6a8ff"]} />

      {/* vanity: desk + round mirror + stool + bottles */}
      <group position={[3.5, 0, -6.8]}>
        <mesh castShadow position={[0, 0.75, 0]}>
          <boxGeometry args={[2.6, 0.15, 1]} />
          <meshStandardMaterial color="#ffd9e8" roughness={0.7} />
        </mesh>
        {[-1.1, 1.1].map((x) => (
          <mesh key={x} position={[x, 0.37, 0]}>
            <boxGeometry args={[0.12, 0.75, 0.8]} />
            <meshStandardMaterial color="#f0b8cf" />
          </mesh>
        ))}
        <mesh position={[0, 1.9, -0.35]}>
          <cylinderGeometry args={[0.55, 0.55, 0.06, 24]} />
          <meshStandardMaterial color="#fff" metalness={0.4} roughness={0.1} emissive="#ffd9e8" emissiveIntensity={0.12} />
        </mesh>
        {/* perfume bottles */}
        {[-0.5, 0, 0.5].map((x, i) => (
          <mesh key={x} position={[x, 0.95, 0.2]}>
            <boxGeometry args={[0.14, 0.3, 0.14]} />
            <meshStandardMaterial color={["#ff9ec2", "#d6a8ff", "#b6c8ff"][i]} transparent opacity={0.85} />
          </mesh>
        ))}
        {/* stool */}
        <mesh position={[0, 0.5, 1]}>
          <cylinderGeometry args={[0.35, 0.35, 0.2, 16]} />
          <meshStandardMaterial color="#ff9ec2" />
        </mesh>
      </group>

      {/* wardrobe */}
      <mesh castShadow position={[6.6, 1.5, -6.6]}>
        <boxGeometry args={[2.6, 3, 1.1]} />
        <meshStandardMaterial color="#ffe0ea" roughness={0.85} />
      </mesh>
      {[-0.5, 0.5].map((x) => (
        <mesh key={x} position={[6.6 + x, 1.5, -6.05]}>
          <boxGeometry args={[0.06, 1, 0.06]} />
          <meshStandardMaterial color={TRIM} />
        </mesh>
      ))}

      {/* bean bag + teddy */}
      <mesh castShadow position={[4.5, 0.4, 3.5]}>
        <sphereGeometry args={[0.8, 16, 12]} />
        <meshStandardMaterial color="#b6c8ff" roughness={0.95} />
      </mesh>
      <Teddy x={2.6} y={0} z={3} color="#ffc7de" />

      {/* dresser */}
      <mesh castShadow position={[0, 0.5, -7]}>
        <boxGeometry args={[2.4, 1, 0.9]} />
        <meshStandardMaterial color="#ffe0c0" roughness={0.85} />
      </mesh>
      {[0.35, 0.7].map((y) =>
        [-0.6, 0.6].map((x) => (
          <mesh key={`${x}-${y}`} position={[x, y, -6.55]}>
            <boxGeometry args={[0.15, 0.12, 0.06]} />
            <meshStandardMaterial color="#ff9ec2" />
          </mesh>
        ))
      )}

      {/* wall hearts art + fairy lights on the back wall */}
      {[-5, -4, -5.9].map((x, i) => (
        <mesh key={i} position={[x + 4, 2.6 + (i % 2) * 0.5, -7.7]} scale={0.35}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color="#ff7aa8" emissive="#ff4f86" emissiveIntensity={0.3} />
        </mesh>
      ))}
      <FairyLights from={[-7, 3.4, -7.6]} to={[7, 3.4, -7.6]} count={14} />

      <Plant x={7} z={4.5} y={0} />
      <Plant x={-6.5} z={-6.5} y={0} />
      {/* little lamp on the dresser */}
      <mesh position={[0.8, 1.2, -7]}>
        <coneGeometry args={[0.3, 0.45, 12]} />
        <meshStandardMaterial color="#ffd9e8" emissive="#ff9ec2" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

/* ============================================================= floor 3: boy room */
function BoyRoom() {
  return (
    <group position={[0, F3, -26]}>
      {/* rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 1]}>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial color="#cfe0ff" roughness={0.95} />
      </mesh>
      {/* platform bed */}
      <group position={[-9, 0, -1]}>
        <mesh castShadow position={[0, 0.35, 0]}>
          <boxGeometry args={[4, 0.5, 3]} />
          <meshStandardMaterial color="#3f4a63" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.68, 0]}>
          <boxGeometry args={[3.8, 0.25, 2.8]} />
          <meshStandardMaterial color="#8aa0d8" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.9, -1]}>
          <boxGeometry args={[1.6, 0.3, 0.7]} />
          <meshStandardMaterial color="#dfe7ff" />
        </mesh>
      </group>
      {/* study desk with monitor + keyboard + chair */}
      <group position={[8, 0, -2.5]}>
        <mesh castShadow position={[0, 0.75, 0]}>
          <boxGeometry args={[4, 0.15, 1.4]} />
          <meshStandardMaterial color={TRIM} roughness={0.7} />
        </mesh>
        {[-1.8, 1.8].map((x) => (
          <mesh key={x} position={[x, 0.375, 0]}>
            <boxGeometry args={[0.15, 0.75, 1.2]} />
            <meshStandardMaterial color="#5a4636" />
          </mesh>
        ))}
        {/* monitor */}
        <mesh position={[0, 1.35, -0.4]}>
          <boxGeometry args={[1.8, 1, 0.08]} />
          <meshStandardMaterial color="#1c1a22" emissive="#3a6bff" emissiveIntensity={0.3} />
        </mesh>
        {/* keyboard */}
        <mesh position={[0, 0.85, 0.3]}>
          <boxGeometry args={[1.4, 0.06, 0.5]} />
          <meshStandardMaterial color="#2a2730" />
        </mesh>
        {/* chair */}
        <mesh position={[0, 0.6, 1.6]}>
          <boxGeometry args={[1, 0.15, 1]} />
          <meshStandardMaterial color="#3a3340" />
        </mesh>
        <mesh position={[0, 1.2, 2]}>
          <boxGeometry args={[1, 1.2, 0.15]} />
          <meshStandardMaterial color="#3a3340" />
        </mesh>
      </group>
      {/* projector + big screen on the back wall */}
      <Projector />
      {/* bookshelf */}
      <Bookshelf x={13} z={-2} colors={["#3a6bff", "#7fd7ff", "#b6e3a1", "#ffd36e", "#ff7a90"]} />
    </group>
  );
}

function Projector() {
  const [on, setOn] = useState(false);
  const mat = useRef<MeshStandardMaterial>(null);
  const col = useRef(new Color());
  useFrame((state) => {
    if (!mat.current) return;
    if (on) {
      const t = state.clock.elapsedTime;
      col.current.setHSL((0.55 + Math.sin(t * 0.4) * 0.1) % 1, 0.6, 0.6);
      mat.current.color.copy(col.current);
      mat.current.emissive.copy(col.current);
      mat.current.emissiveIntensity = 0.9;
    } else {
      mat.current.color.set("#f2eee6");
      mat.current.emissive.set("#000");
      mat.current.emissiveIntensity = 0;
    }
  });
  return (
    <group position={[0, 0, -3.6]}>
      {/* screen on the back wall */}
      <mesh
        position={[0, 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          setOn((o) => !o);
          useGame.getState().showMessage(on ? "game over 🎮" : "projector on — big screen night! 🎬");
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        <planeGeometry args={[6, 3.4]} />
        <meshStandardMaterial ref={mat} color="#f2eee6" />
      </mesh>
      {/* the projector unit hanging from the ceiling */}
      <mesh position={[0, 3.6, 4]}>
        <boxGeometry args={[0.7, 0.4, 0.9]} />
        <meshStandardMaterial color="#33303a" />
      </mesh>
    </group>
  );
}

/* ============================================================= floor 3: balcony */
function Balcony() {
  return (
    <group position={[0, F3, 0]}>
      {/* outdoor rugs on each wing */}
      {[-10.5, 10.5].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.03, -18]}>
          <planeGeometry args={[9, 3.6]} />
          <meshStandardMaterial color="#ffe9d6" roughness={0.95} />
        </mesh>
      ))}
      {/* glass railings on the wing fronts + planters with flowers along them */}
      {[-10.5, 10.5].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.6, -16]}>
            <boxGeometry args={[11, 1.1, 0.1]} />
            <meshStandardMaterial color={GLASS} transparent opacity={0.3} roughness={0.1} />
          </mesh>
          {/* planter box */}
          <mesh position={[x, 0.35, -16.1]}>
            <boxGeometry args={[10, 0.5, 0.5]} />
            <meshStandardMaterial color="#ffd9e8" roughness={0.85} />
          </mesh>
          {[-4, -2, 0, 2, 4].map((dx, i) => (
            <group key={dx} position={[x + dx, 0.75, -16.1]}>
              <mesh>
                <sphereGeometry args={[0.18, 8, 8]} />
                <meshStandardMaterial color={["#ff9ec2", "#ffd36e", "#d6a8ff", "#b6c8ff", "#ff7a90"][i]} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* left wing: L-sofa + coffee table + hanging egg swing chair */}
      <group position={[-10.5, 0, -18.5]}>
        <mesh castShadow position={[0, 0.4, 0.8]}>
          <boxGeometry args={[5, 0.5, 1.3]} />
          <meshStandardMaterial color="#c9a06f" roughness={0.85} />
        </mesh>
        <mesh castShadow position={[0, 0.9, 1.35]}>
          <boxGeometry args={[5, 0.7, 0.3]} />
          <meshStandardMaterial color="#b8895c" roughness={0.85} />
        </mesh>
        {[-1.6, 0, 1.6].map((x, i) => (
          <mesh key={x} position={[x, 0.75, 0.8]}>
            <boxGeometry args={[1.1, 0.25, 1]} />
            <meshStandardMaterial color={["#ff9ec2", "#ffd36e", "#b6e3a1"][i]} roughness={0.9} />
          </mesh>
        ))}
        {/* coffee table with two cups */}
        <mesh position={[0, 0.3, -0.8]}>
          <cylinderGeometry args={[0.7, 0.7, 0.5, 16]} />
          <meshStandardMaterial color="#fff" roughness={0.6} />
        </mesh>
        {[-0.25, 0.25].map((x) => (
          <mesh key={x} position={[x, 0.62, -0.8]}>
            <cylinderGeometry args={[0.1, 0.1, 0.16, 10]} />
            <meshStandardMaterial color={x < 0 ? "#ff9ec2" : "#b6c8ff"} />
          </mesh>
        ))}
        {/* hanging egg swing chair */}
        <group position={[3, 0, -0.5]}>
          <mesh position={[0, 3, 0]}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshStandardMaterial color={TRIM} />
          </mesh>
          <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 2, 6]} />
            <meshStandardMaterial color="#c89b78" />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <sphereGeometry args={[0.7, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
            <meshStandardMaterial color="#fff0f6" roughness={0.9} side={2} />
          </mesh>
          <mesh position={[0, 0.75, 0]}>
            <sphereGeometry args={[0.55, 12, 10]} />
            <meshStandardMaterial color="#ff9ec2" roughness={0.9} />
          </mesh>
        </group>
      </group>

      {/* right wing: bistro set + two loungers + parasol */}
      <group position={[10.5, 0, -18.5]}>
        {[-2.3, 2.3].map((x) => (
          <mesh key={x} castShadow position={[x, 0.35, 0.6]} rotation={[-0.2, 0, 0]}>
            <boxGeometry args={[1.2, 0.15, 2.4]} />
            <meshStandardMaterial color="#b6e3ff" roughness={0.9} />
          </mesh>
        ))}
        {/* bistro table + chairs */}
        <mesh position={[0, 0.7, -0.8]}>
          <cylinderGeometry args={[0.6, 0.6, 0.12, 16]} />
          <meshStandardMaterial color="#fff" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.35, -0.8]}>
          <cylinderGeometry args={[0.08, 0.08, 0.7, 8]} />
          <meshStandardMaterial color="#c8c8d0" metalness={0.4} />
        </mesh>
        {[-1, 1].map((x) => (
          <mesh key={x} position={[x, 0.4, -0.8]}>
            <cylinderGeometry args={[0.3, 0.3, 0.15, 12]} />
            <meshStandardMaterial color="#ff9ec2" />
          </mesh>
        ))}
        {/* parasol */}
        <mesh position={[0, 2, -0.8]}>
          <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
          <meshStandardMaterial color="#c89b78" />
        </mesh>
        <mesh position={[0, 3.6, -0.8]}>
          <coneGeometry args={[2.2, 1.1, 16]} />
          <meshStandardMaterial color="#ff9ec2" />
        </mesh>
      </group>

      {/* fairy lights strung across the balcony front */}
      <FairyLights from={[-15, 2.6, -16]} to={[-6, 2.6, -16]} count={10} />
      <FairyLights from={[6, 2.6, -16]} to={[15, 2.6, -16]} count={10} />
    </group>
  );
}

/* ============================================================= floor 4: gym */
function Gym() {
  return (
    <group position={[0, F4, -37]}>
      {/* rubber gym-floor mat */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[30, 9]} />
        <meshStandardMaterial color="#3f3a46" roughness={1} />
      </mesh>
      {/* mirror wall (back) */}
      <mesh position={[0, 2.2, -4.7]}>
        <boxGeometry args={[16, 3.6, 0.1]} />
        <meshStandardMaterial color="#dff1ff" metalness={0.6} roughness={0.08} emissive="#eaf6ff" emissiveIntensity={0.08} />
      </mesh>

      {/* treadmill */}
      <group position={[-11, 0, 1]}>
        <mesh castShadow position={[0, 0.2, 0]}>
          <boxGeometry args={[1.4, 0.3, 2.4]} />
          <meshStandardMaterial color="#2a2730" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.22, -0.6]}>
          <boxGeometry args={[1.2, 0.06, 1.4]} />
          <meshStandardMaterial color="#5a5560" />
        </mesh>
        {[-0.55, 0.55].map((x) => (
          <mesh key={x} position={[x, 0.9, 1]}>
            <cylinderGeometry args={[0.05, 0.05, 1.4, 8]} />
            <meshStandardMaterial color="#c8c8d0" metalness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 1.5, 1]}>
          <boxGeometry args={[1, 0.6, 0.1]} />
          <meshStandardMaterial color="#1c1a22" emissive="#3a6bff" emissiveIntensity={0.25} />
        </mesh>
      </group>

      {/* weight bench + barbell */}
      <group position={[-4, 0, 1]}>
        <mesh castShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[0.7, 0.2, 2.2]} />
          <meshStandardMaterial color="#ff6f91" roughness={0.7} />
        </mesh>
        {[-0.8, 0.8].map((z) => (
          <mesh key={z} position={[0, 0.25, z]}>
            <boxGeometry args={[0.6, 0.5, 0.15]} />
            <meshStandardMaterial color="#2a2730" />
          </mesh>
        ))}
        {/* barbell rack posts + bar + plates */}
        {[-0.6, 0.6].map((x) => (
          <mesh key={x} position={[x, 1.1, -0.8]}>
            <cylinderGeometry args={[0.05, 0.05, 0.7, 8]} />
            <meshStandardMaterial color="#c8c8d0" metalness={0.5} />
          </mesh>
        ))}
        <mesh position={[0, 1.4, -0.8]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 2.4, 10]} />
          <meshStandardMaterial color="#c8c8d0" metalness={0.6} />
        </mesh>
        {[-1.1, 1.1].map((x) => (
          <mesh key={x} position={[x, 1.4, -0.8]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.28, 0.28, 0.12, 20]} />
            <meshStandardMaterial color="#2a2730" />
          </mesh>
        ))}
      </group>

      {/* dumbbell rack */}
      <group position={[3, 0, 3.4]}>
        <mesh castShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[2.4, 1, 0.6]} />
          <meshStandardMaterial color="#5a5560" metalness={0.3} />
        </mesh>
        {[0.55, 0.85].map((y) =>
          [-0.7, 0, 0.7].map((x) => (
            <group key={`${x}-${y}`} position={[x, y, 0.35]}>
              {[-0.22, 0.22].map((dx) => (
                <mesh key={dx} position={[dx, 0, 0]}>
                  <sphereGeometry args={[0.14, 8, 8]} />
                  <meshStandardMaterial color={["#ff9ec2", "#7fd7ff", "#ffd36e"][((x + 0.7) / 0.7) | 0]} />
                </mesh>
              ))}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.44, 6]} />
                <meshStandardMaterial color="#2a2730" />
              </mesh>
            </group>
          ))
        )}
      </group>

      {/* yoga mat + exercise ball */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[9, 0.05, 1]}>
        <planeGeometry args={[1.4, 3]} />
        <meshStandardMaterial color="#b6e3a1" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[11.5, 0.7, 1]}>
        <sphereGeometry args={[0.7, 20, 16]} />
        <meshStandardMaterial color="#ff9ec2" roughness={0.6} />
      </mesh>
      {/* water cooler */}
      <group position={[13, 0, 3.5]}>
        <mesh castShadow position={[0, 0.6, 0]}>
          <boxGeometry args={[0.7, 1.2, 0.7]} />
          <meshStandardMaterial color="#eaf2ff" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.6, 16]} />
          <meshStandardMaterial color="#9ec8ff" transparent opacity={0.6} />
        </mesh>
      </group>
      {/* motivational heart poster on the mirror wall */}
      <mesh position={[6, 2.6, -4.6]} scale={0.5}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial color="#ff7aa8" emissive="#ff4f86" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

/* ============================================ extra furniture in the deep back */
function ExtraFurniture() {
  return (
    <group>
      {/* ground-floor dining nook (back) */}
      <group position={[-6, 0, -37]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <planeGeometry args={[8, 6]} />
          <meshStandardMaterial color="#ffe0ee" roughness={0.95} />
        </mesh>
        <mesh castShadow position={[0, 0.75, 0]}>
          <boxGeometry args={[4, 0.15, 1.8]} />
          <meshStandardMaterial color={TRIM} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.3, 0.75, 1.4]} />
          <meshStandardMaterial color={TRIM} />
        </mesh>
        {[-1.5, 0, 1.5].map((x) =>
          [-1.3, 1.3].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 0.45, z]}>
              <boxGeometry args={[0.6, 0.9, 0.6]} />
              <meshStandardMaterial color={z < 0 ? "#ff9ec2" : "#b6c8ff"} roughness={0.9} />
            </mesh>
          ))
        )}
        {/* pendant light */}
        <mesh position={[0, 2.6, 0]}>
          <coneGeometry args={[0.5, 0.5, 16]} />
          <meshStandardMaterial color="#fff3c0" emissive="#ffe082" emissiveIntensity={0.5} />
        </mesh>
      </group>
      {/* corner plants on the ground floor */}
      <Plant x={13} z={-39} />
      <Plant x={-14} z={-39} />

      {/* F2 reading nook (back) */}
      <group position={[7, F2, -38]}>
        <mesh castShadow position={[0, 0.6, 0]}>
          <boxGeometry args={[1.6, 1.2, 1.6]} />
          <meshStandardMaterial color="#ffc7de" roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.3, -0.7]}>
          <boxGeometry args={[1.6, 1.2, 0.3]} />
          <meshStandardMaterial color="#ffb3d1" roughness={0.9} />
        </mesh>
        <mesh position={[-1.6, 1.4, 0]}>
          <cylinderGeometry args={[0.05, 0.08, 2.6, 8]} />
          <meshStandardMaterial color="#c89b78" />
        </mesh>
        <mesh position={[-1.6, 2.7, 0]}>
          <coneGeometry args={[0.4, 0.5, 12]} />
          <meshStandardMaterial color="#ffd9e8" emissive="#ff9ec2" emissiveIntensity={0.4} />
        </mesh>
      </group>

      {/* F3 gaming bean bags (back) */}
      {[-6, -3].map((x) => (
        <mesh key={x} castShadow position={[x, F3 + 0.4, -38]}>
          <sphereGeometry args={[0.8, 16, 12]} />
          <meshStandardMaterial color={x < -4 ? "#7fd7ff" : "#b6e3a1"} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

/* ============================================================= outside: pool */
function Pool() {
  const water = useRef<Mesh>(null);
  useFrame((state) => {
    if (water.current) water.current.position.y = 0.12 + Math.sin(state.clock.elapsedTime * 1.2) * 0.02;
  });
  return (
    <group position={[0, 0, 8]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <planeGeometry args={[30, 16]} />
        <meshStandardMaterial color="#ffe9d6" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#bfe0d0" />
      </mesh>
      <mesh
        ref={water}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.12, 0]}
        onClick={(e) => {
          e.stopPropagation();
          useGame.getState().showMessage("last one in's a slow kitty! 🩵");
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        <planeGeometry args={[13.4, 7.4]} />
        <meshStandardMaterial color="#8fd3ff" transparent opacity={0.8} roughness={0.15} metalness={0.3} />
      </mesh>
      <mesh position={[-3, 0.2, 1]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.24, 12, 24]} />
        <meshStandardMaterial color="#ff9ec2" />
      </mesh>
      <mesh position={[3, 0.45, -1]}>
        <sphereGeometry args={[0.45, 16, 12]} />
        <meshStandardMaterial color="#ffd36e" />
      </mesh>
    </group>
  );
}

/* ============================================================= misc */
function Bookshelf({ x, z, colors, rot = 0 }: { x: number; z: number; colors: string[]; rot?: number }) {
  const shelves = [0.5, 1.35, 2.2, 3.05];
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      {/* tall cabinet */}
      <mesh castShadow position={[0, 1.8, 0]}>
        <boxGeometry args={[0.5, 3.7, 3.4]} />
        <meshStandardMaterial color="#ffe0c0" roughness={0.85} />
      </mesh>
      {/* shelf boards */}
      {shelves.map((y) => (
        <mesh key={y} position={[0.02, y - 0.28, 0]}>
          <boxGeometry args={[0.5, 0.06, 3.4]} />
          <meshStandardMaterial color={TRIM} />
        </mesh>
      ))}
      {/* rows of books (some leaning) */}
      {shelves.map((y, r) =>
        Array.from({ length: 7 }).map((_, i) => {
          const lean = i === 5 ? 0.25 : 0;
          return (
            <mesh key={`${r}-${i}`} position={[0.06, y + 0.02, -1.4 + i * 0.42]} rotation={[lean, 0, 0]}>
              <boxGeometry args={[0.34, 0.55 + (i % 3) * 0.05, 0.3]} />
              <meshStandardMaterial color={colors[(i + r) % colors.length]} roughness={0.8} />
            </mesh>
          );
        })
      )}
      {/* a plant + a plush on top */}
      <mesh position={[0.05, 3.75, -0.8]}>
        <cylinderGeometry args={[0.18, 0.14, 0.3, 8]} />
        <meshStandardMaterial color="#ff9ec2" />
      </mesh>
      <mesh position={[0.05, 4.05, -0.8]}>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#9be88f" flatShading />
      </mesh>
    </group>
  );
}

/** A little string of warm fairy lights between two points. */
function FairyLights({ from, to, count = 10 }: { from: [number, number, number]; to: [number, number, number]; count?: number }) {
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => {
        const t = i / (count - 1);
        const x = from[0] + (to[0] - from[0]) * t;
        const y = from[1] + (to[1] - from[1]) * t - Math.sin(t * Math.PI) * 0.4; // droop
        const z = from[2] + (to[2] - from[2]) * t;
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color="#fff3c0" emissive="#ffe082" emissiveIntensity={0.9} />
          </mesh>
        );
      })}
    </group>
  );
}

/** A cute little teddy plush. */
function Teddy({ x, y, z, color = "#e8b98a" }: { x: number; y: number; z: number; color?: string }) {
  return (
    <group position={[x, y, z]} scale={0.6}>
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.4, 12, 10]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.3, 12, 10]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {[-0.22, 0.22].map((dx) => (
        <mesh key={dx} position={[dx, 1.12, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      {[-0.28, 0.28].map((dx) => (
        <mesh key={dx} position={[dx, 0.5, 0.3]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 0.9, 0.28]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ff9ec2" />
      </mesh>
    </group>
  );
}

function Plant({ x, z, y = 0 }: { x: number; z: number; y?: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.3, 0.24, 0.6, 10]} />
        <meshStandardMaterial color="#ff9ec2" />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial color="#9be88f" flatShading />
      </mesh>
    </group>
  );
}
