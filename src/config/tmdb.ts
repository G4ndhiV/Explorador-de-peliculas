/**
 * TMDB: la clave sigue siendo “pública” en el navegador, pero no debe versionarse.
 * Configura `VITE_TMDB_API_KEY` en `.env` (ver `.env.example`).
 */
const key = import.meta.env.VITE_TMDB_API_KEY;

if (import.meta.env.PROD && !key) {
  console.error(
    "[CineScope] Falta VITE_TMDB_API_KEY. Añádela en las variables de entorno del build (p. ej. Vercel)."
  );
}

export const TMDB_API_KEY = key ?? "";

/**
 * Idioma de las respuestas: títulos, sinopsis, géneros, tagline, etc.
 * @see https://developer.themoviedb.org/docs/languages
 */
export const TMDB_LANGUAGE = import.meta.env.VITE_TMDB_LANGUAGE ?? "es-ES";
