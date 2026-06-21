import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sky, Stars, Cloud, Clouds } from "@react-three/drei";
import { Color, MathUtils } from "three";
import { useGame } from "../store/useGame";

/**
 * Drives the whole atmosphere from `useGame.time` (0..1 over a day).
 *
 * Everything is computed in render from the reactive `time` value so the sky,
 * sun, fog and background all stay in sync. `autoTime` advances time gently
 * (throttled) so we don't re-render every single frame.
 */
export default function SkyDayNight() {
  const time = useGame((s) => s.time);

  const palette = useMemo(
    () => ({
      dayLight: new Color("#fff4e0"),
      nightLight: new Color("#aab8ff"),
      daySky: new Color("#cdeeff"),
      nightSky: new Color("#2a2f55"),
      sunset: new Color("#ffc39a"),
    }),
    []
  );

  // --- derive sun + atmosphere from the time of day ---
  const a = time * Math.PI * 2 - Math.PI / 2;
  const height = Math.sin(a); // -1 midnight .. 1 noon
  const sunPos: [number, number, number] = [Math.cos(a) * 120, Math.max(height, -0.2) * 120, 60];
  const day = MathUtils.clamp((height + 0.18) / 0.5, 0, 1);
  const sunset = Math.max(0, 1 - Math.abs(height) * 5) * MathUtils.clamp(height + 0.3, 0, 1);
  const night = 1 - day;

  // background / fog colour
  const bg = palette.nightSky.clone().lerp(palette.daySky, day).lerp(palette.sunset, sunset * 0.4);
  // sun (key light) colour
  const sunColor = palette.nightLight.clone().lerp(palette.dayLight, day).lerp(palette.sunset, sunset * 0.5);

  // advance time when on auto — throttled to ~6 updates/sec via accumulator
  useFrame((_, delta) => {
    const g = useGame.getState();
    if (g.autoTime && g.phase !== "intro") {
      acc.current += delta;
      if (acc.current > 0.16) {
        g.setTime(g.time + acc.current / 240); // full day ≈ 4 min
        acc.current = 0;
      }
    }
  });

  return (
    <>
      {/* solid, always-bright background + a *very* light fog for depth only */}
      <color attach="background" args={[bg.r, bg.g, bg.b]} />
      <fogExp2 attach="fog" args={[bg.getHex(), 0.0026]} />

      <Sky sunPosition={sunPos} turbidity={3} rayleigh={day > 0.3 ? 0.8 : 2} mieCoefficient={0.004} mieDirectionalG={0.85} />

      {/* stars only meaningfully visible at night */}
      {night > 0.35 && <Stars radius={160} depth={60} count={1800} factor={3.5} fade speed={0.5} />}

      {/* generous, soft lighting so nothing ever reads as "black/ugly" */}
      <hemisphereLight color={"#ffffff"} groundColor={"#bfeccb"} intensity={0.75 + day * 0.35} />
      <ambientLight intensity={0.55 + day * 0.25} />
      <directionalLight
        position={sunPos}
        color={sunColor}
        intensity={0.6 + day * 1.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={260}
        shadow-camera-left={-90}
        shadow-camera-right={90}
        shadow-camera-top={90}
        shadow-camera-bottom={-90}
        shadow-bias={-0.0004}
      />
      {/* a soft warm fill from the opposite side keeps the cat's face lit */}
      <directionalLight position={[-sunPos[0], 40, -sunPos[2]]} color="#ffe9f2" intensity={0.3} />

      {/* fluffy pastel clouds */}
      <Clouds limit={50} range={120}>
        <Cloud seed={1} position={[24, 34, -34]} speed={0.16} opacity={0.55} bounds={[24, 4, 12]} color="#ffffff" />
        <Cloud seed={4} position={[-42, 32, 22]} speed={0.12} opacity={0.45} bounds={[20, 4, 10]} color="#fff0f6" />
        <Cloud seed={7} position={[2, 38, 44]} speed={0.14} opacity={0.5} bounds={[26, 5, 14]} color="#eef7ff" />
      </Clouds>
    </>
  );
}

// module-scoped accumulator for throttling auto-time (avoids a re-render to hold it)
const acc = { current: 0 };
