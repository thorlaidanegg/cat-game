import { useMemo } from "react";
import { areaCenter, seeded } from "./layout";
import { Flower, Tree, SakuraTree, Mushroom, Bush } from "./props/Nature";
import { Bench, Swing, Lantern, Bridge } from "./props/Structures";
import PlaygroundSlides from "./props/PlaygroundSlides";
import Lake from "./props/Lake";
import Note from "./props/Note";
import HeartTree from "./props/HeartTree";
import RaceTrack from "./props/RaceTrack";
import Car from "./props/Car";
import Butterflies from "./particles/Butterflies";
import Petals from "./particles/Petals";
import HeartBubbles from "./particles/HeartBubbles";
import Fireworks from "./particles/Fireworks";
import { loveNotes } from "../data/messages";

/** Scatters `n` items inside an area's radius using a deterministic seed. */
function scatter(seed: number, n: number, cx: number, cz: number, radius: number) {
  const rnd = seeded(seed);
  return Array.from({ length: n }).map(() => {
    const a = rnd() * Math.PI * 2;
    const r = Math.sqrt(rnd()) * radius;
    return [cx + Math.cos(a) * r, 0, cz + Math.sin(a) * r] as [number, number, number];
  });
}

/**
 * Composes the entire connected world: every themed area, its props, scattered
 * decorations, love notes and the particle layers. Pure layout — all behaviour
 * lives in the individual prop components.
 */
export default function World() {
  const meadow = areaCenter("meadow");
  const lake = areaCenter("lake");
  const picnic = areaCenter("picnic");
  const sakura = areaCenter("sakura");
  const stargaze = areaCenter("stargaze");
  const heart = areaCenter("heart");

  // deterministic decoration positions — kept sparse + spaced for a clean look
  const meadowFlowers = useMemo(() => scatter(1, 30, meadow.x, meadow.z, 19), [meadow]);
  const meadowTrees = useMemo(() => scatter(2, 5, meadow.x, meadow.z, 20), [meadow]);
  const sakuraTrees = useMemo(() => scatter(3, 7, sakura.x, sakura.z, 14), [sakura]);
  const mushrooms = useMemo(() => scatter(4, 7, sakura.x, sakura.z, 15), [sakura]);
  const lakeLanterns = useMemo(() => scatter(5, 4, lake.x, lake.z, 15), [lake]);
  const picnicFlowers = useMemo(() => scatter(6, 9, picnic.x, picnic.z, 13), [picnic]);
  // bushes kept in the inner park so they never sit on the outer ring road
  const bushes = useMemo(() => scatter(7, 16, 0, 0, 42), []);

  // 50 love notes spread mostly around the picnic + sprinkled everywhere
  const notes = useMemo(() => {
    const rnd = seeded(50);
    return loveNotes.map((_, i) => {
      // 60% clustered near the picnic, 40% anywhere in the world
      const nearPicnic = rnd() < 0.6;
      const cx = nearPicnic ? picnic.x : (rnd() - 0.5) * 120;
      const cz = nearPicnic ? picnic.z : (rnd() - 0.5) * 120;
      const r = nearPicnic ? 12 : 0;
      const a = rnd() * Math.PI * 2;
      const rr = Math.sqrt(rnd()) * r;
      return { index: i, pos: [cx + Math.cos(a) * rr, 0, cz + Math.sin(a) * rr] as [number, number, number] };
    });
  }, [picnic]);

  return (
    <group>
      {/* ---------------- Flower Meadow ---------------- */}
      {meadowFlowers.map((p, i) => (
        <Flower key={`mf${i}`} position={p} />
      ))}
      {meadowTrees.map((p, i) => (
        <Tree key={`mt${i}`} position={p} scale={0.9 + (i % 3) * 0.2} />
      ))}
      <Swing position={[meadow.x + 9, 0, meadow.z + 9]} rotation={-0.4} />
      <PlaygroundSlides position={[meadow.x - 12, 0, meadow.z - 4]} />
      <Bench position={[meadow.x - 6, 0, meadow.z + 7]} rotation={-0.6} />
      <Butterflies count={12} center={[meadow.x, 0, meadow.z]} spread={26} />
      <HeartBubbles count={10} />

      {/* bushes scattered across the whole island */}
      {bushes.map((p, i) => (
        <Bush key={`bush${i}`} position={p} scale={0.8 + (i % 4) * 0.25} berries={i % 3 === 0} />
      ))}

      {/* ---------------- Quiet Lake ---------------- */}
      <Lake position={[lake.x, 0, lake.z]} />
      <Bridge position={[lake.x + 11, 0, lake.z]} rotation={Math.PI / 2} />
      {lakeLanterns.map((p, i) => (
        <Lantern key={`ll${i}`} position={p} />
      ))}

      {/* ---------------- Picnic Spot ---------------- */}
      <Picnic position={[picnic.x, 0, picnic.z]} />
      {picnicFlowers.map((p, i) => (
        <Flower key={`pf${i}`} position={p} />
      ))}
      <Bench position={[picnic.x + 6, 0, picnic.z - 4]} rotation={1.2} />

      {/* love notes everywhere */}
      {notes.map((n) => (
        <Note key={`note${n.index}`} index={n.index} position={n.pos} />
      ))}

      {/* ---------------- Sakura Garden ---------------- */}
      {sakuraTrees.map((p, i) => (
        <SakuraTree key={`st${i}`} position={p} scale={1 + (i % 3) * 0.25} />
      ))}
      {mushrooms.map((p, i) => (
        <Mushroom key={`mush${i}`} position={p} scale={0.8 + (i % 3) * 0.3} />
      ))}
      <Bench position={[sakura.x, 0, sakura.z + 6]} />
      <Petals count={70} center={[sakura.x, 0, sakura.z]} spread={28} color="#ffc3df" />

      {/* ---------------- Stargazing Hill ---------------- */}
      <Stargaze position={[stargaze.x, 0, stargaze.z]} />

      {/* ---------------- Ring Road around the whole park ---------------- */}
      <RaceTrack position={[0, 0, 0]} />
      <Car />
      <Fireworks position={[48, 0, 9]} />

      {/* ---------------- Heart Garden (ending) ---------------- */}
      <HeartTree position={[heart.x, 0, heart.z]} />
      {scatter(9, 12, heart.x, heart.z, 12).map((p, i) => (
        <Flower key={`hf${i}`} position={p} color="#ff9ec2" />
      ))}
    </group>
  );
}

/** Picnic blanket + a few cute treats. */
function Picnic({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial color="#ff9ec2" roughness={0.95} />
      </mesh>
      {/* basket */}
      <mesh castShadow position={[1, 0.3, 1]}>
        <boxGeometry args={[0.7, 0.5, 0.5]} />
        <meshStandardMaterial color="#c98f63" />
      </mesh>
      {/* cake */}
      <mesh castShadow position={[-1, 0.2, -0.5]}>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#fff0f5" />
      </mesh>
      <mesh position={[-1, 0.42, -0.5]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#ff4f86" emissive="#ff4f86" emissiveIntensity={0.4} />
      </mesh>
      {/* teddy */}
      <group position={[0.6, 0, -1]}>
        <mesh castShadow position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#c98f63" />
        </mesh>
        <mesh castShadow position={[0, 0.75, 0]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#c98f63" />
        </mesh>
        {[-0.16, 0.16].map((x) => (
          <mesh key={x} position={[x, 0.92, 0]}>
            <sphereGeometry args={[0.08, 10, 10]} />
            <meshStandardMaterial color="#c98f63" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Stargazing hill: blanket + a tiny telescope, lovely at night. */
function Stargaze({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <planeGeometry args={[3.5, 3.5]} />
        <meshStandardMaterial color="#d9d4ff" roughness={0.95} />
      </mesh>
      {/* telescope */}
      <group position={[1.2, 0, 0.5]} rotation={[0, 0.4, 0]}>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.2, 0.4, Math.sin(a) * 0.2]} rotation={[0, 0, 0.2]}>
              <cylinderGeometry args={[0.03, 0.03, 0.9, 6]} />
              <meshStandardMaterial color="#7a5c54" />
            </mesh>
          );
        })}
        <mesh position={[0, 0.9, 0]} rotation={[0.6, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.13, 0.8, 12]} />
          <meshStandardMaterial color="#5a4636" metalness={0.4} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
