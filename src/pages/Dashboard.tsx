import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getFavorites, removeFavorite } from "../config/firebase";
import type { Movie } from "../types/Movie";
import { fadeInUp, staggerContainer, cardLift } from "../motion/variants";
import { TrashIcon } from "@heroicons/react/24/outline";

const Dashboard = () => {
  const [favorites, setFavorites] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      const favs = await getFavorites();
      setFavorites(favs);
    };
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (movieId: number) => {
    await removeFavorite(movieId);
    setFavorites((prev) => prev.filter((movie) => movie.id !== movieId));
  };

  return (
    <div className="min-h-[70vh]">
      <section className="border-b border-white/[0.06] px-4 py-10 md:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl text-center"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/90">
            Panel
          </p>
          <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
            Favoritos en la nube
          </h1>
          <p className="mt-3 text-zinc-400">
            Lista guardada en Firebase vinculada a tu cuenta. Elimina títulos que ya no quieras conservar.
          </p>
        </motion.div>
      </section>

      <div className="mx-auto max-w-[1600px] px-4 py-10 md:px-8">
        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-20 text-center"
          >
            <p className="text-lg text-zinc-400">No hay favoritos en tu cuenta todavía.</p>
            <p className="mt-2 text-sm text-zinc-500">Añade películas desde las tarjetas o el detalle.</p>
            <Link
              to="/"
              className="mt-8 inline-flex rounded-xl bg-amber-500/15 px-6 py-3 text-sm font-semibold text-amber-200 ring-1 ring-amber-500/35 transition hover:bg-amber-500/25"
            >
              Explorar películas
            </Link>
          </motion.div>
        ) : (
          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {favorites.map((movie) => {
              const posterUrl =
                movie.poster?.startsWith("http") && movie.poster.length > 0
                  ? movie.poster
                  : movie.poster
                    ? `https://image.tmdb.org/t/p/w500${movie.poster}`
                    : "https://placehold.co/320x480/12121a/737373?text=Poster";
              return (
                <motion.li
                  key={movie.id}
                  variants={cardLift}
                  className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12121a] shadow-lg shadow-black/30"
                >
                  <div className="flex gap-4 p-4">
                    <Link
                      to={`/movie/${movie.id}`}
                      className="relative h-36 w-24 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10"
                    >
                      <img
                        src={posterUrl}
                        alt=""
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                      <div>
                        <Link to={`/movie/${movie.id}`}>
                          <h2 className="font-display text-lg font-semibold text-white transition hover:text-amber-400 line-clamp-2">
                            {movie.title}
                          </h2>
                        </Link>
                        {movie.rating != null && (
                          <p className="mt-1 text-sm text-amber-400/90">
                            <span aria-hidden>★</span> {movie.rating.toFixed(1)}
                          </p>
                        )}
                      </div>
                      <motion.button
                        type="button"
                        onClick={() => handleRemoveFavorite(movie.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-3 inline-flex w-fit items-center gap-2 rounded-xl bg-rose-500/15 px-3 py-2 text-sm font-medium text-rose-300 ring-1 ring-rose-500/35 transition hover:bg-rose-500/25"
                      >
                        <TrashIcon className="h-4 w-4" aria-hidden />
                        Quitar
                      </motion.button>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
