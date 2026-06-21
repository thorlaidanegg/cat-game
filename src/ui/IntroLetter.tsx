import { motion } from "framer-motion";
import { useGame } from "../store/useGame";
import { audio } from "../audio/AudioManager";

const LETTER = [
  "Hey love ❤️",
  "I know I can't be with you right now.",
  "I'm really sorry.",
  "So I made you a tiny little world where you can smile, explore, and play whenever you miss me.",
  "Every corner here has a little piece of my love.",
  "I hope it makes your day just a little brighter.",
  "Love you always.",
];

/** Cinematic, handwritten apology letter shown before the world appears. */
export default function IntroLetter() {
  const start = useGame((s) => s.start);

  const handleStart = () => {
    audio.init(); // unlock + start ambient music on this user gesture
    start();
  };

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-b from-blush via-cream to-lilac p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 1.2 }}
    >
      {/* drifting hearts behind the letter */}
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute text-petal/70"
          style={{ left: `${(i * 37) % 100}%`, fontSize: `${12 + (i % 4) * 8}px` }}
          initial={{ y: "110vh", opacity: 0 }}
          animate={{ y: "-10vh", opacity: [0, 0.8, 0] }}
          transition={{ duration: 8 + (i % 5), repeat: Infinity, delay: i * 0.6, ease: "easeInOut" }}
        >
          ❤
        </motion.span>
      ))}

      <motion.div
        className="relative max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-white/60 bg-cream/85 p-8 shadow-soft backdrop-blur-md sm:p-12"
        initial={{ y: 40, rotate: -1, opacity: 0 }}
        animate={{ y: 0, rotate: -1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 60, damping: 14 }}
      >
        <div className="mb-6 text-center text-4xl">💌</div>
        <div className="space-y-4 font-hand text-cocoa">
          {LETTER.map((line, i) => (
            <motion.p
              key={i}
              className={i === 0 ? "text-2xl font-bold" : "text-lg leading-relaxed"}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.7, duration: 0.8 }}
            >
              {line}
            </motion.p>
          ))}
        </div>

        <motion.div
          className="mt-10 flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 + LETTER.length * 0.7 + 0.3, duration: 0.6 }}
        >
          <motion.button
            onClick={handleStart}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            className="rounded-full bg-petal px-10 py-4 text-lg font-bold text-white shadow-soft transition hover:bg-petal/90"
          >
            Start ❤️
          </motion.button>
        </motion.div>
        <p className="mt-4 text-center text-xs text-cocoa/50">
          tip: move with W A S D · drag to look · click things to find notes
        </p>
      </motion.div>
    </motion.div>
  );
}
