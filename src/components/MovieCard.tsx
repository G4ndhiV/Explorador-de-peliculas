import { Link } from "react-router-dom";
import { lazy, Suspense, useContext } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { HeartIcon } from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { FavoritesContext } from "../context/FavoritesContext";
import { cardLift } from "../motion/variants";

const LazyImage = lazy(() => import("./LazyImage"));

interface MovieProps {
  title: string;
  poster: string;
  rating: number;
  id: number;
  index?: number;
}

export default function MovieCard({ id, title, poster, rating, index = 0 }: MovieProps) {
  const favoritesContext = useContext(FavoritesContext);
  const reduceMotion = useReducedMotion();
  if (!favoritesContext) return null;

  const { favorites, setFavorite } = favoritesContext;
  const isFavorite = favorites.has(id);

  return (
    <motion.article
      variants={cardLift}
      initial="hidden"
      animate="visible"
      transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12121a] shadow-xl shadow-black/40 transition-shadow duration-300 hover:border-amber-500/25 hover:shadow-amber-500/10">
        <Link to={`/movie/${id}`} className="relative block aspect-[2/3] overflow-hidden">
          <Suspense
            fallback={
              <div className="h-full w-full animate-pulse bg-gradient-to-br from-zinc-800 to-zinc-900" />
            }
          >
            <LazyImage
              src={poster}
              alt=""
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </Suspense>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90" />
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md">
            <span aria-hidden>★</span>
            {rating > 0 ? rating.toFixed(1) : "—"}
          </div>
        </Link>

        <div className="space-y-3 p-4">
          <h3 className="font-display text-base font-semibold leading-snug text-white line-clamp-2">
            <Link
              to={`/movie/${id}`}
              className="transition hover:text-amber-400"
            >
              {title}
            </Link>
          </h3>
          <motion.button
            type="button"
            onClick={() => setFavorite({ id, title, poster, rating })}
            whileHover={{ scale: reduceMotion ? 1 : 1.02 }}
            whileTap={{ scale: reduceMotion ? 1 : 0.98 }}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              isFavorite
                ? "bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40 hover:bg-rose-500/30"
                : "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30 hover:bg-amber-500/25"
            }`}
          >
            {isFavorite ? (
              <>
                <HeartIcon className="h-5 w-5" aria-hidden />
                Quitar
              </>
            ) : (
              <>
                <HeartOutline className="h-5 w-5" aria-hidden />
                Favoritos
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
