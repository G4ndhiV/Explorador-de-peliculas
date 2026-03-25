import { FavoritesContext } from "../context/FavoritesContext.tsx";
import MovieCard from "../components/MovieCard";
import { useContext } from "react";
import type { Movie } from "../types/Movie";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { HeartIcon } from "@heroicons/react/24/solid";
import { fadeInUp } from "../motion/variants";

export default function Favorites() {
  const favorites = useContext(FavoritesContext);
  const list = favorites ? Array.from(favorites.favorites.values()) : [];

  return (
    <div className="min-h-[70vh]">
      <section className="border-b border-white/[0.06] px-4 py-10 md:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 ring-1 ring-rose-500/35">
            <HeartIcon className="h-7 w-7 text-rose-400" aria-hidden />
          </div>
          <h1 className="font-display text-3xl font-bold text-white md:text-4xl">Tus favoritos</h1>
          <p className="mt-3 text-zinc-400">
            Colección sincronizada con tu sesión. Desde aquí puedes abrir cada ficha o quitar títulos.
          </p>
        </motion.div>
      </section>

      <div className="mx-auto max-w-[1600px] px-4 py-10 md:px-8">
        {list.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-20 text-center"
          >
            <p className="text-lg text-zinc-400">Aún no has guardado ninguna película.</p>
            <p className="mt-2 text-sm text-zinc-500">
              Explora el inicio o busca por título y pulsa &ldquo;Favoritos&rdquo; en la tarjeta.
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/25"
            >
              Ir al inicio
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {list.map((movie: Movie, i: number) => {
              const posterUrl =
                movie.poster?.startsWith("http") && movie.poster.length > 0
                  ? movie.poster
                  : movie.poster
                    ? `https://image.tmdb.org/t/p/w500${movie.poster}`
                    : "https://placehold.co/500x750/1a1a26/737373?text=Sin+poster";
              return (
                <MovieCard
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  poster={posterUrl}
                  rating={movie.rating ?? 0}
                  index={i}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
