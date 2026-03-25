import { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "../config/firebase.tsx";
import { FavoritesContext } from "./FavoritesContext";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext<{ user: User | null; logout: () => void }>({
    user: null,
    logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const favoritesContext = useContext(FavoritesContext); // 👈 Accede al contexto de favoritos
    const navigate = useNavigate(); // 👈 Para redirigir al login

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    function logout() {
        signOut(auth)
            .then(() => {
                if (favoritesContext) {
                    favoritesContext.clearFavorites(); // 👈 Limpia los favoritos al cerrar sesión
                }
                navigate("/login"); // 👈 Redirige al login
            })
            .catch((error) => {
                console.error("❌ Error al cerrar sesión:", error);
            });
    }

    return <AuthContext.Provider value={{ user, logout }}>{children}</AuthContext.Provider>;
}
