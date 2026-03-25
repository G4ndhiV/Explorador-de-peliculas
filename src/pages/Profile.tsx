import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../config/firebase.tsx";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { fadeInUp } from "../motion/variants";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          setUsername(docSnap.data().username ?? "");
          setBio(docSnap.data().bio ?? "");
        }
      });
    }
  }, [user]);

  async function handleSave() {
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), { username, bio });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        navigate("/profile");
      } catch (e) {
        alert("Error: " + (e as Error).message);
      }
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] px-4 py-12 md:px-8">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-lg"
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#16161f] to-[#0e0e14] p-1 shadow-2xl shadow-black/50">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-amber-500/25 blur-3xl"
            aria-hidden
          />
          <div className="relative rounded-[1.35rem] bg-[#12121a]/95 p-8 backdrop-blur-xl md:p-10">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/40 to-orange-600/30 ring-1 ring-amber-500/40">
                <UserCircleIcon className="h-9 w-9 text-amber-200" aria-hidden />
              </div>
              <h1 className="font-display text-2xl font-bold text-white">Tu perfil</h1>
              <p className="mt-2 text-sm text-zinc-500">
                {user?.email ?? "Sesión no disponible"}
              </p>
            </div>

            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Nombre visible
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Cómo quieres que te llamen"
              className="mb-6 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder:text-zinc-600 focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />

            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Biografía
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Películas que amas, géneros favoritos..."
              rows={4}
              className="mb-8 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder:text-zinc-600 focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />

            <motion.button
              type="button"
              onClick={handleSave}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/25"
            >
              {saved ? "Guardado ✓" : "Guardar cambios"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
