import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import MovieCard from "../components/MovieCard";
import { Movie } from "./Home";
import { fadeInUp } from "../motion/variants";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { TMDB_API_KEY, TMDB_LANGUAGE } from "../config/tmdb";

const TMDB_API_URL = "https://api.themoviedb.org/3/search/movie";

export default function Search() {
  const location = useLocation();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  const query = new URLSearchParams(location.search).get("q");

  useEffect(() => {
    if (!query) {
      setMovies([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    axios
      .get(
        `${TMDB_API_URL}?api_key=${TMDB_API_KEY}&language=${encodeURIComponent(
          TMDB_LANGUAGE
        )}&query=${encodeURIComponent(query)}`
      )
      .then((res) => {
        if (!cancelled) setMovies(res.data.results ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="min-h-[70vh]">
      <section className="border-b border-white/[0.06] px-4 py-10 md:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-600/20 ring-1 ring-amber-500/30">
            <MagnifyingGlassIcon className="h-7 w-7 text-amber-400" aria-hidden />
          </div>
          <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
            Resultados de búsqueda
          </h1>
          {query ? (
            <p className="mt-3 text-zinc-400">
              Mostrando resultados para{" "}
              <span className="font-semibold text-amber-400/90">&ldquo;{query}&rdquo;</span>
            </p>
          ) : (
            <p className="mt-3 text-zinc-400">
              Escribe un término en la barra superior y pulsa <strong className="text-zinc-300">Ir</strong>.
            </p>
          )}
        </motion.div>
      </section>

      <div className="mx-auto max-w-[1600px] px-4 py-10 md:px-8">
        <AnimatePresence mode="wait">
          {!query ? (
            <motion.div
              key="empty-query"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center"
            >
              <p className="text-lg text-zinc-400">
                Sin término de búsqueda. Usa el campo en la cabecera para explorar el catálogo TMDB.
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex rounded-xl bg-amber-500/15 px-5 py-2.5 text-sm font-semibold text-amber-300 ring-1 ring-amber-500/35 transition hover:bg-amber-500/25"
              >
                Ver tendencias
              </Link>
            </motion.div>
          ) : loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#12121a]">
                  <div className="aspect-[2/3] animate-pulse bg-zinc-800" />
                  <div className="space-y-2 p-4">
                    <div className="h-4 animate-pulse rounded bg-zinc-800" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : movies.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/[0.08] bg-[#12121a]/80 px-6 py-16 text-center backdrop-blur-sm"
            >
              <p className="text-lg text-zinc-300">No encontramos películas para esa búsqueda.</p>
              <p className="mt-2 text-sm text-zinc-500">Prueba con otro título o revisa la ortografía.</p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            >
              {movies.map((movie, i) =>
                movie.poster_path ? (
                  <MovieCard
                    key={movie.id}
                    id={movie.id}
                    title={movie.title}
                    poster={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    rating={movie.vote_average}
                    index={i}
                  />
                ) : null
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
