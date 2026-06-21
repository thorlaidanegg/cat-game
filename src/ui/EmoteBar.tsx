import { motion } from "framer-motion";
import { useGame } from "../store/useGame";
import type { EmoteType } from "../three/emoteRuntime";

const EMOTES: { type: EmoteType; icon: string; label: string }[] = [
  { type: "kiss", icon: "😚", label: "kiss" },
  { type: "cuddle", icon: "🤗", label: "cuddle" },
  { type: "nuzzle", icon: "😽", label: "nuzzle" },
  { type: "dance", icon: "💃", label: "dance" },
];

/**
 * A little floating bar of cute couple emotes. Tapping one calls the two cats
 * together to kiss / cuddle / nuzzle / dance, with floating hearts.
 */
export default function EmoteBar() {
  const playEmote = useGame((s) => s.playEmote);
  const emote = useGame((s) => s.emote);
  const riding = useGame((s) => s.riding);

  if (riding) return null; // emotes pause during rides

  return (
    <div data-ui className="pointer-events-auto absolute bottom-24 left-4 z-30 flex flex-col gap-2">
      <div className="text-center font-hand text-xs text-cocoa/70">together ❤️</div>
      <div className="flex gap-2 rounded-full bg-white/70 p-2 shadow-soft backdrop-blur">
        {EMOTES.map((e) => (
          <motion.button
            key={e.type}
            onClick={() => playEmote(e.type)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            disabled={emote !== null}
            title={e.label}
            className={`flex h-11 w-11 items-center justify-center rounded-full text-2xl transition ${
              emote === e.type ? "bg-petal/70" : "bg-white/80 hover:bg-petal/30"
            } disabled:opacity-50`}
          >
            {e.icon}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
