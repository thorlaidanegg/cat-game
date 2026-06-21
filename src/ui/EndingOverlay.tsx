import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const FINAL = [
  "Distance is temporary.",
  "My love isn't.",
  "Until we're together again…",
  "I'll keep building little worlds for you.",
  "❤️",
];

/**
 * The ending overlay fades the text in over the slowly-circling camera scene,
 * then deepens to black as the cat curls up to sleep in the Heart Garden.
 */
export default function EndingOverlay() {
  const [black, setBlack] = useState(false);

  useEffect(() => {
    // fade the whole screen to black after the message has had time to land
    const t = window.setTimeout(() => setBlack(true), FINAL.length * 1600 + 4000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    >
      {/* vignette + final fade-to-black */}
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: black ? 1 : 0.15 }}
        transition={{ duration: black ? 4 : 2 }}
      />

      <div className="relative z-10 max-w-lg text-center">
        {FINAL.map((line, i) => (
          <motion.p
            key={i}
            className={i === FINAL.length - 1 ? "mt-6 text-5xl" : "font-hand text-2xl leading-relaxed text-white"}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 + i * 1.6, duration: 1.4 }}
          >
            {line}
          </motion.p>
        ))}

        <motion.button
          className="pointer-events-auto mt-12 rounded-full bg-white/20 px-6 py-2 text-sm text-white/90 backdrop-blur transition hover:bg-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: black ? 1 : 0 }}
          transition={{ delay: 0.5, duration: 2 }}
          onClick={() => window.location.reload()}
        >
          stay a little longer ↺
        </motion.button>
      </div>
    </motion.div>
  );
}
