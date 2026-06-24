import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, Preload } from "@react-three/drei";
import SkyDayNight from "./SkyDayNight";
import Ground from "./Ground";
import World from "./World";
import Cat from "./Cat";
import CompanionCat from "./CompanionCat";
import Fireflies from "./particles/Fireflies";
import EmoteHearts from "./particles/EmoteHearts";
import Joystick from "../ui/Joystick";

/**
 * Mounts the whole 3D experience. The Canvas is created once the intro is
 * dismissed (see App). Postprocessing adds the dreamy bloom + soft vignette;
 * AdaptiveDpr keeps the frame-rate up on weaker devices.
 */
export default function Experience() {
  return (
    <>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ fov: 55, near: 0.1, far: 400, position: [0, 6, 16] }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <SkyDayNight />
          <Ground />
          <World />
          <Fireflies count={110} area={150} />
          <Cat />
          <CompanionCat />
          <EmoteHearts />
          <Preload all />
        </Suspense>

        <AdaptiveDpr pixelated />
      </Canvas>

      {/* touch-only movement stick */}
      <Joystick />
    </>
  );
}
