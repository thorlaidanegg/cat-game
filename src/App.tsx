import { Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { useGame } from "./store/useGame";
import Experience from "./three/Experience";
import IntroLetter from "./ui/IntroLetter";
import HUD from "./ui/HUD";
import NotePopup from "./ui/NotePopup";
import EndingOverlay from "./ui/EndingOverlay";
import LoadingVeil from "./ui/LoadingVeil";
import SwingUI from "./ui/SwingUI";
import RaceUI from "./ui/RaceUI";
import GamesPanel from "./ui/GamesPanel";

export default function App() {
  const phase = useGame((s) => s.phase);

  return (
    <div className="relative h-full w-full overflow-hidden bg-blush">
      {/* The 3D world mounts once the intro has been started, so the heavy
          scene + audio context only spin up after a user gesture. */}
      {phase !== "intro" && (
        <Suspense fallback={<LoadingVeil />}>
          <Experience />
        </Suspense>
      )}

      {/* HUD only while exploring */}
      <AnimatePresence>{phase === "playing" && <HUD key="hud" />}</AnimatePresence>

      {/* mini-game panels + games menu */}
      {phase === "playing" && <SwingUI />}
      {phase === "playing" && <RaceUI />}
      {phase === "playing" && <GamesPanel />}

      {/* Love-note reader */}
      <NotePopup />

      {/* Cinematic intro */}
      <AnimatePresence>{phase === "intro" && <IntroLetter key="intro" />}</AnimatePresence>

      {/* Ending sequence overlay */}
      <AnimatePresence>{phase === "ending" && <EndingOverlay key="ending" />}</AnimatePresence>
    </div>
  );
}
