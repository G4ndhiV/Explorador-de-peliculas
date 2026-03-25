import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase.tsx";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { fadeInUp } from "../motion/variants";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/login");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden px-4 py-12 md:flex md:items-stretch md:px-0 md:py-0">
      <div
        className="pointer-events-none absolute right-1/4 top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-[100px]"
        aria-hidden
      />

      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-[#12121a] shadow-2xl shadow-black/60 md:min-h-[560px] md:flex-row-reverse"
      >
        <div className="relative flex flex-1 flex-col justify-center bg-gradient-to-bl from-violet-600/90 via-indigo-800/90 to-slate-900/95 px-8 py-12 md:px-12 md:py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-30 bg-[url('data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'0.08\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E')]"
            aria-hidden
          />
          <h2 className="font-display relative text-3xl font-bold text-white md:text-4xl">
            Únete a CineScope
          </h2>
          <p className="relative mt-4 max-w-sm text-base text-white/90">
            Crea una cuenta para sincronizar favoritos, escribir reseñas y personalizar tu perfil.
          </p>
        </div>

        <div className="flex flex-1 flex-col justify-center px-8 py-12 md:px-12 md:py-16">
          <h3 className="font-display text-2xl font-semibold text-white">Registro</h3>
          <p className="mt-2 text-sm text-zinc-500">Solo necesitas correo y una contraseña segura.</p>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
            >
              {error}
            </motion.p>
          )}

          <form onSubmit={handleSignup} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-500">Correo</label>
              <div className="relative">
                <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-white placeholder:text-zinc-600 focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-500">Contraseña</label>
              <div className="relative">
                <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-white placeholder:text-zinc-600 focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/20"
            >
              Crear cuenta
            </motion.button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="font-medium text-amber-400 hover:text-amber-300">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
