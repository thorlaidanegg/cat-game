import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "../store/useGame";
import { areaCenter } from "../three/layout";
import { catRuntime } from "../three/catRuntime";
import { carRuntime } from "../three/carRuntime";

interface GameEntry {
  icon: string;
  title: string;
  how: string;
  action: () => void;
}

/**
 * A floating "games & places" menu. Solves "I can't find the swing": every
 * activity is listed with a one-tap button that whisks the cat straight there
 * (the swing one even hops her on automatically).
 */
export default function GamesPanel() {
  const [open, setOpen] = useState(false);
  const g = useGame.getState;

  const meadow = areaCenter("meadow");

  const entries: GameEntry[] = [
    {
      icon: "🌸",
      title: "Swing",
      how: "Tap SPACE to swing higher",
      action: () => g().mountSwing(),
    },
    {
      icon: "🛝",
      title: "Slides",
      how: "Click a slide to whoosh down it",
      action: () => catRuntime.goTo(meadow.x - 12, meadow.z + 3),
    },
    {
      icon: "🫧",
      title: "Bubble Pop",
      how: "Click floating hearts in the meadow",
      action: () => catRuntime.goTo(meadow.x, meadow.z + 4),
    },
    {
      icon: "🌼",
      title: "Flower Picking",
      how: "Click flowers to grow a bouquet",
      action: () => catRuntime.goTo(meadow.x - 6, meadow.z),
    },
    {
      icon: "💌",
      title: "Love Notes",
      how: "Find & open the little paper notes",
      action: () => {
        const p = areaCenter("picnic");
        catRuntime.goTo(p.x, p.z);
      },
    },
    {
      icon: "🦆",
      title: "Visit the Lake",
      how: "Say hi to the ducks",
      action: () => {
        const l = areaCenter("lake");
        catRuntime.goTo(l.x + 13, l.z);
      },
    },
    {
      icon: "🏎️",
      title: "Drive / Race",
      how: "Cruise the ring road · 3 laps to race",
      action: () => {
        carRuntime.reset();
        g().startRace();
      },
    },
    {
      icon: "⭐",
      title: "Stargazing",
      how: "Switches to a starry night",
      action: () => {
        const s = areaCenter("stargaze");
        catRuntime.goTo(s.x, s.z);
        useGame.setState({ time: 0.95, autoTime: false });
      },
    },
    {
      icon: "💖",
      title: "Heart Garden",
      how: "Walk to the glowing tree (the ending)",
      action: () => {
        const h = areaCenter("heart");
        catRuntime.goTo(h.x, h.z - 11);
      },
    },
  ];

  return (
    <div data-ui className="pointer-events-auto absolute right-4 top-28 z-30 flex flex-col items-end">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full bg-white/75 px-4 py-2 text-cocoa shadow-soft backdrop-blur transition hover:bg-white"
      >
        🎮 games
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            className="mt-2 w-72 max-w-[80vw] rounded-3xl border border-white/60 bg-cream/90 p-3 shadow-soft backdrop-blur"
          >
            <p className="px-2 pb-2 font-hand text-cocoa/70">tap one and I'll take you there ❤️</p>
            <div className="flex flex-col gap-1.5">
              {entries.map((e) => (
                <button
                  key={e.title}
                  onClick={() => {
                    e.action();
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 rounded-2xl bg-white/70 px-3 py-2 text-left transition hover:bg-petal/30"
                >
                  <span className="text-2xl">{e.icon}</span>
                  <span className="flex flex-col">
                    <span className="text-sm font-bold text-cocoa">{e.title}</span>
                    <span className="text-xs text-cocoa/60">{e.how}</span>
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
