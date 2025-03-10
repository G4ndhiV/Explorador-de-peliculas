import { createContext, useState, useEffect, ReactNode } from "react";
import { auth, getFavorites, saveFavorite, removeFavorite } from "../config/firebase.tsx";
import { Movie } from '../pages/Home.tsx';

export interface ContextProps {
    favorites: Map<number, Movie>;
    setFavorite: (movie: Movie) => void;
    clearFavorites: () => void; // 👈 Nueva función para limpiar favoritos
}

export const FavoritesContext = createContext<ContextProps | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState(new Map<number, Movie>());

    useEffect(() => {
        const fetchFavorites = async () => {
            if (auth.currentUser) {
                const favs = await getFavorites();
                const favMap = new Map<number, Movie>();
                favs.forEach(movie => favMap.set(movie.id, movie));
                setFavorites(favMap);
            }
        };
        fetchFavorites();
    }, [auth.currentUser]);

    async function setFavorite(movie: Movie) {
        if (!auth.currentUser) return;

        const newFavorites = new Map(favorites);
        if (!favorites.has(movie.id)) {
            newFavorites.set(movie.id, movie);
            await saveFavorite(movie);
        } else {
            newFavorites.delete(movie.id);
            await removeFavorite(movie.id);
        }
        setFavorites(newFavorites);
    }

    function clearFavorites() {  // 👈 Nueva función para limpiar favoritos
        setFavorites(new Map());
    }

    return (
        <FavoritesContext.Provider value={{ favorites, setFavorite, clearFavorites }}>
            {children}
        </FavoritesContext.Provider>
    );
}
