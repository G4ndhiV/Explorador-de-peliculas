import { Link, useNavigate, NavLink } from "react-router-dom";
import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { MagnifyingGlassIcon, FilmIcon } from "@heroicons/react/24/outline";
import { FavoritesContext } from "../context/FavoritesContext";
import { AuthContext } from "../context/AuthContext";

export default function NavBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const favorites = useContext(FavoritesContext);
  const { logout, user } = useContext(AuthContext);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  function handleLogout(event: React.FormEvent) {
    event.preventDefault();
    logout();
    navigate(`/`);
  }

  const favCount = favorites?.favorites.size ?? 0;

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#07070c]/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-2 font-display text-lg font-semibold tracking-tight text-white"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600/90 text-white shadow-lg shadow-amber-500/25">
            <FilmIcon className="h-5 w-5" aria-hidden />
          </span>
          <span className="hidden sm:inline">
            Cine<span className="text-amber-400">Scope</span>
          </span>
        </Link>

        <nav className="order-3 flex w-full flex-wrap items-center justify-center gap-1 md:order-none md:w-auto md:justify-start">
          {[
            { to: "/", label: "Inicio" },
            { to: "/search", label: "Buscar" },
            { to: "/favorites", label: "Favoritos" },
            { to: "/dashboard", label: "Panel" },
            { to: "/profile", label: "Perfil" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "relative z-0 inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
                  isActive ? "text-amber-400" : "text-zinc-400 hover:text-white",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 z-0 rounded-lg bg-white/[0.06]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <form
          onSubmit={handleSearch}
          className="flex min-w-0 flex-1 items-center gap-2 md:max-w-sm md:flex-initial"
        >
          <div className="relative flex min-w-0 flex-1 items-center">
            <MagnifyingGlassIcon
              className="pointer-events-none absolute left-3 h-4 w-4 text-zinc-500"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar películas..."
              aria-label="Buscar películas"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/20"
          >
            Ir
          </motion.button>
        </form>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          {user ? (
            <>
              <Link
                to="/favorites"
                className="relative flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-300 transition hover:border-amber-500/30 hover:text-white"
              >
                <span className="text-amber-400" aria-hidden>
                  ★
                </span>
                <span className="hidden sm:inline">{favCount}</span>
              </Link>
              <span className="hidden max-w-[140px] truncate text-xs text-zinc-500 md:inline" title={user.email ?? ""}>
                {user.email}
              </span>
              <form onSubmit={handleLogout}>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-xl border border-white/15 bg-transparent px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/25 hover:bg-white/5 hover:text-white"
                >
                  Salir
                </motion.button>
              </form>
            </>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/signup"
                  className="inline-block rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/25 hover:bg-white/5 hover:text-white"
                >
                  Registro
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/login"
                  className="inline-block rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/20"
                >
                  Entrar
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
