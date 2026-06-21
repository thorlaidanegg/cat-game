import { motion } from "framer-motion";

/** Soft pastel loading screen shown while the 3D scene streams in. */
export default function LoadingVeil() {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-gradient-to-b from-blush to-lilac">
      <motion.div
        className="text-6xl"
        animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        🐱
      </motion.div>
      <p className="mt-4 font-hand text-lg text-cocoa/80">warming up the little world…</p>
    </div>
  );
}
