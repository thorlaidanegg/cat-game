import { motion } from "framer-motion";
import { useEffect } from "react";
import { useGame, AREA_LABELS } from "../store/useGame";
import { audio } from "../audio/AudioManager";

/** Minimal, floating, pastel heads-up display. */
export default function HUD() {
  const { hearts, flowers, area, objective, muted, time, autoTime } = useGame();
  const toggleMute = useGame((s) => s.toggleMute);
  const toggleAutoTime = useGame((s) => s.toggleAutoTime);
  const setTime = useGame((s) => s.setTime);

  // keep the audio engine in sync with the mute flag
  useEffect(() => {
    audio.setMuted(muted);
  }, [muted]);

  const timeLabel =
    time < 0.2 || time > 0.85
      ? "Night"
      : time < 0.35
      ? "Morning"
      : time < 0.62
      ? "Afternoon"
      : "Sunset";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="pointer-events-none absolute inset-0 z-20 select-none p-4"
    >
      {/* top-left: collectibles */}
      <div className="flex flex-col gap-2">
        <Pill>❤️ {hearts}</Pill>
        <Pill>🌸 {flowers}</Pill>
      </div>

      {/* top-center: current area */}
      <div className="absolute left-1/2 top-4 -translate-x-1/2">
        <div className="rounded-full bg-white/70 px-5 py-2 font-hand text-cocoa shadow-soft backdrop-blur">
          {AREA_LABELS[area]} · {timeLabel}
        </div>
      </div>

      {/* top-right: controls */}
      <div className="pointer-events-auto absolute right-4 top-4 flex flex-col items-end gap-2">
        <button
          onClick={toggleMute}
          className="rounded-full bg-white/70 px-4 py-2 text-cocoa shadow-soft backdrop-blur transition hover:bg-white"
        >
          {muted ? "🔇" : "🎵"}
        </button>
        <button
          onClick={toggleAutoTime}
          className="rounded-full bg-white/70 px-4 py-2 text-xs text-cocoa shadow-soft backdrop-blur transition hover:bg-white"
        >
          {autoTime ? "🕒 auto" : "🕒 manual"}
        </button>
        {!autoTime && (
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={time}
            onChange={(e) => setTime(parseFloat(e.target.value))}
            className="w-28 accent-petal"
          />
        )}
      </div>

      {/* bottom-center: objective */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="max-w-[90vw] rounded-2xl bg-white/70 px-5 py-2 text-center font-hand text-sm text-cocoa shadow-soft backdrop-blur">
          ✨ {objective}
        </div>
      </div>
    </motion.div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-cocoa shadow-soft backdrop-blur">
      {children}
    </div>
  );
}
