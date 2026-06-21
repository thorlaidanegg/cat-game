import { useMemo } from "react";
import { BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, Vector3 } from "three";
import { carRuntime } from "../carRuntime";

// A big ring road (WORLD coordinates) that loops all the way around the park,
// sweeping past every area so you can drive everywhere and hop off near a game.
const WAYPOINTS: [number, number][] = [
  [48, 9], // east — by the picnic
  [30, 58], // north-east sweep
  [-42, 52], // north-west — by the heart garden
  [-58, -13], // west — by the lake
  [-30, -52], // south-west
  [9, -58], // south — by the sakura garden
  [56, -50], // south-east — by stargazing hill
  [64, -10], // east straight
];

const N = 420; // centerline samples (more = smoother on a big loop)
const HALF = 8; // road half-width — nice and wide

/** Builds a flat ribbon BufferGeometry of given half-width along the curve. */
function ribbon(points: Vector3[], tangents: Vector3[], half: number, y: number) {
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= N; i++) {
    const p = points[i % N];
    const t = tangents[i % N];
    const nx = t.z; // left-normal in XZ
    const nz = -t.x;
    pos.push(p.x + nx * half, y, p.z + nz * half); // left
    pos.push(p.x - nx * half, y, p.z - nz * half); // right
  }
  for (let i = 0; i < N; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/**
 * A real race circuit. The centerline is a closed Catmull-Rom curve; the road
 * is a ribbon mesh swept along it, with a white border ribbon underneath and a
 * checkered start line. The evenly-spaced centerline samples are published to
 * `carRuntime` so the car stays on the road and laps count on any shape.
 */
export default function RaceTrack({ position }: { position: [number, number, number] }) {
  const offset = useMemo(() => new Vector3(...position), [position]);

  const { road, border, points, tangents, startHeading } = useMemo(() => {
    const curve = new CatmullRomCurve3(
      WAYPOINTS.map(([x, z]) => new Vector3(x, 0, z)),
      true,
      "catmullrom",
      0.5
    );
    const spaced = curve.getSpacedPoints(N); // N+1 pts, last ~= first
    const points = spaced.slice(0, N);
    const tangents = points.map((p, i) => {
      const nxt = points[(i + 1) % N];
      return new Vector3(nxt.x - p.x, 0, nxt.z - p.z).normalize();
    });
    const road = ribbon(points, tangents, HALF, 0.06);
    const border = ribbon(points, tangents, HALF + 1, 0.04);
    const startHeading = Math.atan2(tangents[0].x, tangents[0].z);
    return { road, border, points, tangents, startHeading };
  }, []);

  // publish world-space centerline + start for the driving + lap logic
  carRuntime.samples = points.map((p) => p.clone().add(offset));
  carRuntime.half = HALF;
  carRuntime.start.copy(points[0]).add(offset);
  carRuntime.startHeading = startHeading;
  if (carRuntime.pos.lengthSq() === 0) carRuntime.pos.copy(carRuntime.start);

  // checkered start line (boxes laid across the road at sample 0)
  const startLine = useMemo(() => {
    const cells = 8;
    return Array.from({ length: cells }).map((_, i) => {
      const off = (i / (cells - 1) - 0.5) * 2 * (HALF - 0.4);
      return { x: off, color: i % 2 === 0 ? "#ffffff" : "#2c2730" };
    });
  }, []);

  return (
    <group position={position}>
      {/* white border (slightly wider, sits just under the asphalt) */}
      <mesh geometry={border} receiveShadow>
        <meshStandardMaterial color="#fdfdfd" roughness={0.9} />
      </mesh>
      {/* asphalt road */}
      <mesh geometry={road} receiveShadow>
        <meshStandardMaterial color="#5d5763" roughness={1} />
      </mesh>

      {/* checkered start / finish line */}
      <group position={[points[0].x, 0.09, points[0].z]} rotation={[0, startHeading, 0]}>
        {startLine.map((c, i) => (
          <mesh key={i} position={[c.x, 0, 0]}>
            <boxGeometry args={[(2 * (HALF - 0.4)) / 8, 0.02, 1.8]} />
            <meshStandardMaterial color={c.color} />
          </mesh>
        ))}
      </group>

      {/* a couple of cheerful start banners */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[points[0].x + Math.cos(startHeading) * s * (HALF + 1), 1.6, points[0].z - Math.sin(startHeading) * s * (HALF + 1)]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 3.2, 8]} />
          <meshStandardMaterial color="#ff9ec2" />
        </mesh>
      ))}
    </group>
  );
}
