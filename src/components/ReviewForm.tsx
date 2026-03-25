import { useState, useContext } from "react";
import { db } from "../config/firebase.tsx";
import { addDoc, collection } from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { PaperAirplaneIcon, SparklesIcon } from "@heroicons/react/24/outline";

interface ReviewFormProps {
  movieId: number;
  onPosted?: () => void;
}

export default function ReviewForm({ movieId, onPosted }: ReviewFormProps) {
  const { user } = useContext(AuthContext);
  const [review, setReview] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !review.trim() || sending) return;
    setSending(true);
    try {
      await addDoc(collection(db, "reviews"), {
        movieId,
        review: review.trim(),
        userName: user.email,
        userId: user.uid,
      });
      setReview("");
      setDone(true);
      onPosted?.();
      window.setTimeout(() => setDone(false), 3200);
    } catch {
      /* Firestore errors: user sees empty state */
    } finally {
      setSending(false);
    }
  }

  const len = review.length;
  const max = 2000;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="relative">
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value.slice(0, max))}
          placeholder="¿Qué te pareció la película? Ritmo, interpretación, fotografía…"
          rows={5}
          className="min-h-[140px] w-full resize-y rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-[15px] leading-relaxed text-zinc-100 placeholder:text-zinc-600 shadow-inner transition focus:border-amber-500/45 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-zinc-600">
          <span>{len > 0 ? `${len} / ${max}` : `Hasta ${max} caracteres`}</span>
          <AnimatePresence>
            {done && (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-1 font-medium text-emerald-400/90"
              >
                <SparklesIcon className="h-4 w-4" aria-hidden />
                Publicada
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <motion.button
          type="submit"
          disabled={!review.trim() || sending}
          whileHover={{ scale: review.trim() && !sending ? 1.02 : 1 }}
          whileTap={{ scale: review.trim() && !sending ? 0.98 : 1 }}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-600 px-7 py-3.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/25 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <PaperAirplaneIcon className="h-4 w-4" aria-hidden />
          {sending ? "Publicando…" : "Publicar reseña"}
        </motion.button>
      </div>
    </form>
  );
}
