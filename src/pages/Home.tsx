import { useEffect, useState } from "react";
import axios from "axios";
import { motion, useReducedMotion } from "framer-motion";
import MovieCard from "../components/MovieCard.tsx";
import { staggerContainer, fadeInUp } from "../motion/variants";
import { TMDB_API_KEY, TMDB_LANGUAGE } from "../config/tmdb";

const trendingUrl = (page: number) =>
  `https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_API_KEY}&language=${encodeURIComponent(
    TMDB_LANGUAGE
  )}&page=${page}`;

export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  overview: string;
}

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axios
      .get(trendingUrl(1))
      .then((response) => {
        if (!cancelled) {
          setMovies(response.data.results ?? []);
          setTotalPages(Math.min(response.data.total_pages ?? 1, 500));
          setPage(1);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function loadMore() {
    if (loadingMore || page >= totalPages) return;
    const next = page + 1;
    setLoadingMore(true);
    try {
      const { data } = await axios.get(trendingUrl(next));
      const incoming: Movie[] = data.results ?? [];
      setMovies((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const merged = [...prev];
        for (const m of incoming) {
          if (!seen.has(m.id)) {
            seen.add(m.id);
            merged.push(m);
          }
        }
        return merged;
      });
      setPage(next);
    } finally {
      setLoadingMore(false);
    }
  }

  const hasMore = page < totalPages;

  return (
    <div className="relative">
      <section className="relative overflow-hidden border-b border-white/[0.06] px-4 pb-12 pt-10 md:px-8 md:pb-16 md:pt-14">
        <div
          className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-amber-500/20 blur-[100px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-orange-600/15 blur-[90px]"
          aria-hidden
        />

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="relative mx-auto max-w-4xl text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/90">
            Tendencias de hoy
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
            Descubre qué está{" "}
            <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
              en cartelera
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400 md:text-lg">
            Películas populares actualizadas cada día. Explora, guarda favoritos y profundiza en cada ficha.
          </p>
        </motion.div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 py-10 md:px-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#12121a]"
              >
                <div
                  className="aspect-[2/3] animate-pulse bg-gradient-to-br from-zinc-800 to-zinc-900"
                  style={{ animationDelay: `${i * 50}ms` }}
                />
                <div className="space-y-2 p-4">
                  <div className="h-4 animate-pulse rounded bg-zinc-800" />
                  <div className="h-8 animate-pulse rounded-lg bg-zinc-800/80" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
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
                  index={reduceMotion ? 0 : i}
                />
              ) : null
            )}
          </motion.div>
        )}

        {!loading && hasMore && (
          <div className="mt-12 flex flex-col items-center gap-3 border-t border-white/[0.06] pt-10">
            <p className="text-center text-sm text-zinc-500">
              Mostrando {movies.length} títulos · página {page} de {totalPages}
            </p>
            <motion.button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              whileHover={{ scale: loadingMore ? 1 : 1.02 }}
              whileTap={{ scale: loadingMore ? 1 : 0.98 }}
              className="inline-flex min-w-[200px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-600 px-8 py-3.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/25 disabled:cursor-wait disabled:opacity-70"
            >
              {loadingMore ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-950/30 border-t-zinc-950" />
                  Cargando…
                </>
              ) : (
                <>
                  Ver más películas
                  <span aria-hidden className="text-lg leading-none">
                    ↓
                  </span>
                </>
              )}
            </motion.button>
          </div>
        )}

        {!loading && !hasMore && movies.length > 0 && (
          <p className="mt-10 text-center text-sm text-zinc-600">
            Has llegado al final del catálogo de tendencias de hoy.
          </p>
        )}
      </section>
    </div>
  );
}
