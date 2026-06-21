import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGame, RACE_LAPS } from "../store/useGame";
import { carRuntime } from "../three/carRuntime";

const fmt = (ms: number) => `${(ms / 1000).toFixed(2)}s`;

/** Race overlay: live lap + clock, plus a finish banner with the best time. */
export default function RaceUI() {
  const racing = useGame((s) => s.riding === "car");
  const { raceLap, raceTimeMs, raceFinished, raceBestMs } = useGame();
  const leaveRace = useGame((s) => s.leaveRace);
  const startRace = useGame((s) => s.startRace);

  // E to hop out, R to restart
  useEffect(() => {
    if (!racing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "KeyE") leaveRace();
      if (e.code === "KeyR") {
        carRuntime.reset();
        startRace();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [racing, leaveRace, startRace]);

  if (!racing) return null;

  return (
    <>
      {/* live HUD */}
      <div data-ui className="pointer-events-none absolute left-1/2 top-16 z-30 -translate-x-1/2">
        <div className="flex items-center gap-4 rounded-2xl bg-white/75 px-6 py-2 font-hand text-cocoa shadow-soft backdrop-blur">
          <span className="text-lg font-bold">
            Lap {Math.min(raceLap + (raceFinished ? 0 : 1), RACE_LAPS)}/{RACE_LAPS}
          </span>
          <span>⏱ {fmt(raceTimeMs)}</span>
          {raceBestMs != null && <span className="text-cocoa/60">best {fmt(raceBestMs)}</span>}
        </div>
      </div>

      {/* big easy hop-out button (+ keyboard hint) */}
      <div data-ui className="absolute bottom-16 left-1/2 z-30 -translate-x-1/2 text-center">
        {!raceFinished && (
          <button
            onClick={leaveRace}
            className="pointer-events-auto rounded-full bg-petal px-6 py-2 text-sm font-bold text-white shadow-soft transition hover:bg-petal/90"
          >
            🐾 hop out of the car (E)
          </button>
        )}
        <div className="pointer-events-none mt-1 text-xs text-cocoa/60">R = restart race</div>
      </div>

      {/* finish banner + fireworks (3D fireworks fire in the scene) */}
      <AnimatePresence>
        {raceFinished && (
          <motion.div
            data-ui
            className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.6, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 140, damping: 12 }}
              className="rounded-3xl border border-white/60 bg-cream/90 p-8 text-center shadow-soft backdrop-blur"
            >
              <div className="text-5xl">🎉🏁🎉</div>
              <h2 className="mt-3 font-hand text-3xl font-bold text-cocoa">You did it!</h2>
              <p className="mt-1 font-hand text-xl text-cocoa">time: {fmt(raceTimeMs)}</p>
              {raceBestMs != null && (
                <p className="text-sm text-cocoa/60">
                  {raceTimeMs <= raceBestMs ? "✨ new best! ✨" : `best: ${fmt(raceBestMs)}`}
                </p>
              )}
              <div className="mt-5 flex justify-center gap-3">
                <button
                  onClick={() => {
                    carRuntime.reset();
                    startRace();
                  }}
                  className="pointer-events-auto rounded-full bg-petal px-5 py-2 text-sm font-bold text-white shadow-soft transition hover:bg-petal/90"
                >
                  race again
                </button>
                <button
                  onClick={leaveRace}
                  className="pointer-events-auto rounded-full bg-white/80 px-5 py-2 text-sm font-bold text-cocoa shadow-soft transition hover:bg-white"
                >
                  hop out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
