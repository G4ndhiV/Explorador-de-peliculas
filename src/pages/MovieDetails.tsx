import { useEffect, useState, useContext, lazy, Suspense, Context, useCallback } from "react";
import { FavoritesContext } from "../context/FavoritesContext";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { Movie } from "./Home";
import { AuthContext } from "../context/AuthContext.tsx";
import ReviewForm from "../components/ReviewForm.tsx";
import { db } from "../config/firebase.tsx";
import { TMDB_API_KEY, TMDB_LANGUAGE } from "../config/tmdb";
import { ContextProps } from "../context/FavoritesContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeftIcon,
  HeartIcon as HeartOutline,
  ClockIcon,
  CalendarDaysIcon,
  FilmIcon,
  ChatBubbleBottomCenterTextIcon,
  LanguageIcon,
  BanknotesIcon,
  BuildingOffice2Icon,
  PlayCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

const LazyImage = lazy(() => import("../components/LazyImage"));

const TMDB_API_URL = "https://api.themoviedb.org/3/movie";

interface Review {
  movieId: number;
  review: string;
  userName: string;
  userId: string;
}

interface CrewMember {
  id: number;
  name: string;
  job: string;
}

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

interface CreditsPayload {
  cast: CastMember[];
  crew: CrewMember[];
}

interface VideoResult {
  key: string;
  name: string;
  site: string;
  type: string;
  official?: boolean;
}

interface MovieDetail extends Movie {
  backdrop_path?: string | null;
  release_date?: string;
  runtime?: number;
  genres?: { id: number; name: string }[];
  vote_count?: number;
  tagline?: string;
  original_title?: string;
  status?: string;
  original_language?: string;
  budget?: number;
  revenue?: number;
  imdb_id?: string | null;
  production_companies?: { id: number; name: string; logo_path: string | null }[];
  credits?: CreditsPayload;
  videos?: { results: VideoResult[] };
}

function formatMoneyUSD(n: number): string {
  if (n <= 0) return "—";
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function statusEs(status: string): string {
  const map: Record<string, string> = {
    Released: "Estrenada",
    "Post Production": "Postproducción",
    "In Production": "En producción",
    Planned: "Anunciada",
    Rumored: "Rumor",
    Canceled: "Cancelada",
  };
  return map[status] ?? status;
}

function pickTrailerKey(videos: VideoResult[] | undefined): string | null {
  if (!videos?.length) return null;
  const yt = videos.filter((v) => v.site === "YouTube" && v.key);
  const official = yt.find((v) => v.type === "Trailer" && v.official);
  const trailer = official ?? yt.find((v) => v.type === "Trailer");
  return (trailer ?? yt[0])?.key ?? null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const { setFavorite, favorites } = useContext<ContextProps>(
    FavoritesContext as Context<ContextProps>
  );
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState<Review[]>([]);
  const reduceMotion = useReducedMotion();

  const fetchReviews = useCallback(async () => {
    if (!id) return;
    try {
      const reviewsRef = collection(db, "reviews");
      const q = query(reviewsRef, where("movieId", "==", parseInt(id, 10)));
      const snapshot = await getDocs(q);
      setReviews(snapshot.docs.map((doc) => doc.data() as Review));
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  }, [id]);

  useEffect(() => {
    axios
      .get(
        `${TMDB_API_URL}/${id}?api_key=${TMDB_API_KEY}&language=${encodeURIComponent(
          TMDB_LANGUAGE
        )}&append_to_response=credits,videos`
      )
      .then((res) => setMovie(res.data))
      .catch((error) => console.error("Error fetching movie:", error));
  }, [id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  if (!movie) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4">
        <div className="relative">
          <div className="spinner" />
          <div className="absolute inset-0 animate-ping rounded-full border border-amber-500/20 opacity-40" />
        </div>
        <p className="text-sm tracking-wide text-zinc-500">Cargando ficha cinematográfica…</p>
      </div>
    );
  }

  const isFavorite = favorites?.has(movie.id);
  const backdrop =
    movie.backdrop_path && `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`;
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "";
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
  const releaseLong =
    movie.release_date &&
    new Intl.DateTimeFormat("es", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(movie.release_date));
  const langLabel =
    movie.original_language &&
    new Intl.DisplayNames(["es"], { type: "language" }).of(movie.original_language);
  const directors =
    movie.credits?.crew.filter((c) => c.job === "Director").map((c) => c.name) ?? [];
  const writers =
    movie.credits?.crew.filter((c) =>
      ["Screenplay", "Writer", "Story"].includes(c.job)
    ) ?? [];
  const writerNames = [...new Set(writers.map((w) => w.name))].slice(0, 4);
  const castTop =
    movie.credits?.cast?.slice(0, 12).filter((c) => c.name) ?? [];
  const trailerKey = pickTrailerKey(movie.videos?.results);
  const scorePercent = Math.min(100, Math.max(0, (movie.vote_average / 10) * 100));
  const ringR = 15.5;
  const ringC = 2 * Math.PI * ringR;
  const ringOffset = ringC - (ringC * scorePercent) / 100;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="spinner" />
        </div>
      }
    >
      <article className="relative overflow-hidden">
        {/* ——— Hero cinematográfico ——— */}
        <div className="relative min-h-[72vh] md:min-h-[78vh]">
          {backdrop ? (
            <motion.div
              className="absolute inset-0"
              initial={reduceMotion ? false : { scale: 1.08 }}
              animate={reduceMotion ? undefined : { scale: 1 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <img src={backdrop} alt="" className="h-full w-full object-cover object-center" />
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-[#0a0a12] to-black" />
          )}

          {/* Capas de lectura */}
          <div className="absolute inset-0 bg-[#07070c]/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07070c] via-[#07070c]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07070c] via-[#07070c]/65 to-[#07070c]/25" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(245,158,11,0.12), transparent 55%)",
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.05\'/%3E%3C/svg%3E')]" />

          <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-[1600px] flex-col px-4 pb-14 pt-6 md:min-h-[78vh] md:px-8 md:pb-20 md:pt-8">
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <Link
                to="/"
                className="group inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm font-medium text-zinc-300 backdrop-blur-md transition hover:border-amber-500/35 hover:text-white"
              >
                <ArrowLeftIcon className="h-4 w-4 transition group-hover:-translate-x-0.5" aria-hidden />
                Inicio
              </Link>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mt-8 flex flex-1 flex-col gap-10 lg:mt-12 lg:flex-row lg:items-end lg:gap-14"
            >
              {/* Póster */}
              <motion.div variants={itemVariants} className="mx-auto shrink-0 lg:mx-0">
                <div className="relative">
                  <div
                    className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-amber-500/40 via-orange-500/20 to-transparent opacity-80 blur-xl"
                    aria-hidden
                  />
                  <motion.div
                    whileHover={reduceMotion ? undefined : { y: -4, transition: { duration: 0.35 } }}
                    className="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/60 ring-1 ring-white/15"
                    style={{ maxWidth: "min(100%, 280px)" }}
                  >
                    {posterUrl ? (
                      <LazyImage
                        src={posterUrl}
                        className="aspect-[2/3] w-full object-cover"
                        alt=""
                      />
                    ) : (
                      <div className="flex aspect-[2/3] w-full items-center justify-center bg-zinc-900 text-zinc-600">
                        Sin póster
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Texto */}
              <div className="flex min-w-0 flex-1 flex-col pb-2 lg:pb-4">
                <motion.p
                  variants={itemVariants}
                  className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/90"
                >
                  Ficha de película
                </motion.p>
                <motion.h1
                  variants={itemVariants}
                  className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-white md:text-5xl lg:text-6xl"
                >
                  <span className="bg-gradient-to-br from-white via-white to-zinc-400 bg-clip-text text-transparent">
                    {movie.title}
                  </span>
                </motion.h1>

                {movie.original_title &&
                  movie.original_title !== movie.title && (
                    <motion.p
                      variants={itemVariants}
                      className="mt-2 text-sm text-zinc-500"
                    >
                      Título original:{" "}
                      <span className="text-zinc-400">{movie.original_title}</span>
                    </motion.p>
                  )}

                {movie.tagline && (
                  <motion.p
                    variants={itemVariants}
                    className="mt-4 max-w-2xl font-display text-lg italic leading-snug text-amber-200/85 md:text-xl"
                  >
                    &ldquo;{movie.tagline}&rdquo;
                  </motion.p>
                )}

                <motion.div
                  variants={itemVariants}
                  className="mt-5 flex flex-wrap items-center gap-2 md:gap-3"
                >
                  {year != null && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 backdrop-blur-sm md:text-sm">
                      <CalendarDaysIcon className="h-4 w-4 text-amber-400/90" aria-hidden />
                      {year}
                    </span>
                  )}
                  {movie.runtime != null && movie.runtime > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 backdrop-blur-sm md:text-sm">
                      <ClockIcon className="h-4 w-4 text-amber-400/90" aria-hidden />
                      {movie.runtime} min
                    </span>
                  )}
                  {movie.genres?.slice(0, 4).map((g) => (
                    <span
                      key={g.id}
                      className="rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-200/95"
                    >
                      {g.name}
                    </span>
                  ))}
                  {movie.status && (
                    <span
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300"
                      title="Estado en TMDB"
                    >
                      {statusEs(movie.status)}
                    </span>
                  )}
                  {langLabel && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200">
                      <LanguageIcon className="h-4 w-4 text-amber-400/90" aria-hidden />
                      {langLabel}
                    </span>
                  )}
                  {releaseLong && (
                    <span className="hidden text-xs text-zinc-500 sm:inline md:text-sm">
                      Estreno: {releaseLong}
                    </span>
                  )}
                </motion.div>

                <motion.div variants={itemVariants} className="mt-8 flex flex-wrap items-center gap-6">
                  {/* Puntuación circular */}
                  <div
                    className="relative flex h-20 w-20 shrink-0 items-center justify-center"
                    title="Puntuación TMDB"
                  >
                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36" aria-hidden>
                      <defs>
                        <linearGradient id={`scoreGrad-${movie.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#fbbf24" />
                          <stop offset="100%" stopColor="#f97316" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="18"
                        cy="18"
                        r={ringR}
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="2.5"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r={ringR}
                        fill="none"
                        stroke={`url(#scoreGrad-${movie.id})`}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray={ringC}
                        strokeDashoffset={ringOffset}
                        className="transition-[stroke-dashoffset] duration-1000 ease-out"
                      />
                    </svg>
                    <div className="relative text-center">
                      <span className="block text-2xl font-bold tabular-nums text-white">
                        {movie.vote_average.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500">TMDB</span>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-zinc-500">
                      {movie.vote_count != null && movie.vote_count > 0
                        ? `${movie.vote_count.toLocaleString("es")} valoraciones`
                        : "Valoración de la comunidad"}
                    </p>
                  </div>
                </motion.div>

                <motion.p
                  variants={itemVariants}
                  className="mt-6 max-w-3xl text-base leading-relaxed text-zinc-300/95 md:text-lg md:leading-relaxed"
                >
                  {movie.overview || "Sin sinopsis disponible."}
                </motion.p>

                <motion.div variants={itemVariants} className="mt-10">
                  <motion.button
                    type="button"
                    onClick={() =>
                      setFavorite?.({
                        id: movie.id,
                        title: movie.title,
                        poster: posterUrl || undefined,
                        rating: movie.vote_average,
                      })
                    }
                    whileHover={{ scale: reduceMotion ? 1 : 1.02 }}
                    whileTap={{ scale: reduceMotion ? 1 : 0.98 }}
                    className={`group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl px-8 py-3.5 text-sm font-semibold shadow-xl transition ${
                      isFavorite
                        ? "bg-rose-600 text-white shadow-rose-900/40 ring-2 ring-rose-400/30 hover:bg-rose-500"
                        : "bg-gradient-to-r from-amber-400 via-amber-500 to-orange-600 text-zinc-950 shadow-amber-500/25 hover:brightness-105"
                    }`}
                  >
                    {!isFavorite && (
                      <span
                        className="absolute inset-0 translate-x-[-100%] bg-white/25 transition group-hover:translate-x-[100%] duration-700"
                        aria-hidden
                      />
                    )}
                    {isFavorite ? (
                      <>
                        <HeartSolid className="relative h-5 w-5" aria-hidden />
                        <span className="relative">En favoritos</span>
                      </>
                    ) : (
                      <>
                        <HeartOutline className="relative h-5 w-5" aria-hidden />
                        <span className="relative">Añadir a favoritos</span>
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Separador */}
        <div className="relative h-px w-full bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />

        <div className="relative mx-auto max-w-[1600px] px-4 py-12 md:px-8 md:py-16">
          {/* Ficha técnica + trailer + reparto */}
          <div className="mb-14 grid gap-6 lg:grid-cols-12 lg:gap-8">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`rounded-2xl border border-white/[0.08] bg-[#12121a]/90 p-6 backdrop-blur-sm ${
                trailerKey ? "lg:col-span-5" : "lg:col-span-12"
              }`}
            >
              <h2 className="font-display text-lg font-semibold text-white">Ficha técnica</h2>
              <dl className="mt-5 space-y-4 text-sm">
                {directors.length > 0 && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Dirección
                    </dt>
                    <dd className="mt-1 text-zinc-200">{directors.join(" · ")}</dd>
                  </div>
                )}
                {writerNames.length > 0 && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Guion
                    </dt>
                    <dd className="mt-1 text-zinc-200">{writerNames.join(" · ")}</dd>
                  </div>
                )}
                {movie.production_companies && movie.production_companies.length > 0 && (
                  <div>
                    <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      <BuildingOffice2Icon className="h-4 w-4 text-amber-500/70" aria-hidden />
                      Producción
                    </dt>
                    <dd className="mt-1 text-zinc-300">
                      {movie.production_companies
                        .slice(0, 5)
                        .map((c) => c.name)
                        .join(" · ")}
                    </dd>
                  </div>
                )}
                {(movie.budget != null && movie.budget > 0) ||
                (movie.revenue != null && movie.revenue > 0) ? (
                  <div>
                    <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      <BanknotesIcon className="h-4 w-4 text-amber-500/70" aria-hidden />
                      Cifras (USD)
                    </dt>
                    <dd className="mt-2 grid gap-2 sm:grid-cols-2">
                      {movie.budget != null && movie.budget > 0 && (
                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2">
                          <span className="text-xs text-zinc-500">Presupuesto</span>
                          <p className="font-medium text-zinc-200">{formatMoneyUSD(movie.budget)}</p>
                        </div>
                      )}
                      {movie.revenue != null && movie.revenue > 0 && (
                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2">
                          <span className="text-xs text-zinc-500">Recaudación</span>
                          <p className="font-medium text-zinc-200">{formatMoneyUSD(movie.revenue)}</p>
                        </div>
                      )}
                    </dd>
                  </div>
                ) : null}
                {movie.imdb_id && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Enlaces
                    </dt>
                    <dd className="mt-2">
                      <a
                        href={`https://www.imdb.com/title/${movie.imdb_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-200 transition hover:bg-amber-500/20"
                      >
                        Ver en IMDb
                        <span aria-hidden>↗</span>
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </motion.section>

            {trailerKey && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 lg:col-span-7"
              >
                <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
                  <PlayCircleIcon className="h-5 w-5 text-amber-400" aria-hidden />
                  <h2 className="font-display text-lg font-semibold text-white">Tráiler</h2>
                </div>
                <div className="relative aspect-video w-full bg-black">
                  <iframe
                    title="Tráiler"
                    src={`https://www.youtube-nocookie.com/embed/${trailerKey}?rel=0`}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </motion.section>
            )}
          </div>

          {castTop.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-14"
            >
              <div className="mb-5 flex items-center gap-2">
                <UserGroupIcon className="h-6 w-6 text-amber-400/90" aria-hidden />
                <h2 className="font-display text-xl font-semibold text-white md:text-2xl">
                  Reparto principal
                </h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {castTop.map((person) => (
                  <div
                    key={person.id}
                    className="w-[120px] shrink-0 rounded-xl border border-white/[0.07] bg-[#12121a] p-2 text-center shadow-lg"
                  >
                    <div className="overflow-hidden rounded-lg bg-zinc-800">
                      {person.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                          alt=""
                          className="aspect-[2/3] w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex aspect-[2/3] w-full items-center justify-center bg-zinc-800 text-2xl font-bold text-zinc-600">
                          {person.name[0]}
                        </div>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs font-semibold text-white">{person.name}</p>
                    <p className="line-clamp-2 text-[11px] leading-tight text-zinc-500">{person.character}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {user && (
            <motion.section
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-3xl border border-white/[0.09] bg-gradient-to-b from-[#14141f] to-[#0c0c12] p-1 shadow-2xl shadow-black/40"
            >
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl"
                aria-hidden
              />
              <div className="relative rounded-[1.35rem] bg-[#0e0e14]/90 p-6 backdrop-blur-xl md:p-10">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-12">
                  <div className="flex max-w-md shrink-0 gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-600/20 ring-1 ring-amber-500/30">
                      <ChatBubbleBottomCenterTextIcon className="h-7 w-7 text-amber-300" aria-hidden />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-semibold text-white">Tu reseña</h2>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                        Tu opinión ayuda a otros cinéfilos. Sé honesto y evita spoilers sin avisar.
                      </p>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 md:pt-1">
                    <ReviewForm movieId={movie.id} onPosted={fetchReviews} />
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {!user && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center"
            >
              <FilmIcon className="mx-auto h-10 w-10 text-zinc-600" aria-hidden />
              <p className="mt-4 text-zinc-400">
                <Link to="/login" className="font-medium text-amber-400 hover:text-amber-300">
                  Inicia sesión
                </Link>{" "}
                para publicar una reseña.
              </p>
            </motion.div>
          )}

          {reviews.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5 }}
              className="mt-14 md:mt-20"
            >
              <div className="mb-8 flex items-end justify-between gap-4 border-b border-white/10 pb-4">
                <h2 className="font-display text-2xl font-semibold text-white md:text-3xl">
                  Reseñas de la comunidad
                </h2>
                <span className="text-sm text-zinc-500">{reviews.length} comentario{reviews.length !== 1 ? "s" : ""}</span>
              </div>
              <ul className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                {reviews.map((r, index) => {
                  const initial = (r.userName || "?")[0]?.toUpperCase() ?? "?";
                  return (
                    <motion.li
                      key={`${r.userId}-${index}`}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.04, duration: 0.45 }}
                      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#12121a] p-6 shadow-lg transition hover:border-amber-500/20"
                    >
                      <div className="absolute right-4 top-4 text-5xl font-display font-bold leading-none text-white/[0.04] transition group-hover:text-amber-500/10">
                        &ldquo;
                      </div>
                      <div className="flex gap-4">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-900 text-sm font-bold text-amber-200/90 ring-1 ring-white/10"
                          aria-hidden
                        >
                          {initial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] leading-relaxed text-zinc-200">{r.review}</p>
                          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-zinc-500">
                            {r.userName}
                          </p>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.section>
          )}
        </div>
      </article>
    </Suspense>
  );
}
