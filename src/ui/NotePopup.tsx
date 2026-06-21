import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "../store/useGame";

/** A folded paper note that flutters open with one of her messages. */
export default function NotePopup() {
  const message = useGame((s) => s.activeMessage);
  const closeNote = useGame((s) => s.closeNote);

  return (
    <AnimatePresence>
      {message !== null && (
        <motion.div
          className="absolute inset-0 z-40 flex items-center justify-center bg-cocoa/20 p-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeNote}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.7, rotate: -6, y: 30 }}
            animate={{ scale: 1, rotate: -2, y: 0 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 14 }}
            className="relative w-full max-w-md rounded-2xl border border-white/70 bg-cream p-8 text-center shadow-soft"
          >
            <div className="mb-3 text-3xl">💗</div>
            <p className="font-hand text-2xl leading-relaxed text-cocoa">{message}</p>
            <button
              onClick={closeNote}
              className="mt-6 rounded-full bg-petal px-6 py-2 text-sm font-bold text-white shadow-soft transition hover:bg-petal/90"
            >
              keep ❤️
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
