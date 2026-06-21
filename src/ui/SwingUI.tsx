import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "../store/useGame";
import { swingRuntime } from "../three/swingRuntime";

const ROPE = 1.8;

/** Floating panel shown while riding the swing: live height, best, controls. */
export default function SwingUI() {
  const riding = useGame((s) => s.riding === "swing");
  const best = useGame((s) => s.swingBest);
  const dismount = useGame((s) => s.dismountSwing);
  const [height, setHeight] = useState(0);

  // poll the live swing height a few times a second (no per-frame re-renders)
  useEffect(() => {
    if (!riding) return;
    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      if (t - last > 90) {
        last = t;
        setHeight(Math.round(ROPE * (1 - Math.cos(swingRuntime.amplitude)) * 100));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [riding]);

  if (!riding) return null;
  const pct = Math.min(100, (swingRuntime.amplitude / 1.35) * 100);

  return (
    <motion.div
      data-ui
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pointer-events-none absolute bottom-24 left-1/2 z-30 w-72 -translate-x-1/2"
    >
      <div className="rounded-3xl border border-white/60 bg-cream/85 p-4 text-center shadow-soft backdrop-blur">
        <div className="font-hand text-lg text-cocoa">🌸 Weee! Tap SPACE to swing higher</div>

        {/* live height bar */}
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/70">
          <motion.div
            className="h-full rounded-full bg-petal"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.15 }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-sm text-cocoa">
          <span>height: {height} cm</span>
          <span className="font-bold">best: {best} cm</span>
        </div>

        <button
          onClick={dismount}
          className="pointer-events-auto mt-3 rounded-full bg-petal px-5 py-1.5 text-sm font-bold text-white shadow-soft transition hover:bg-petal/90"
        >
          hop off (E)
        </button>
      </div>
    </motion.div>
  );
}
