import React, { useEffect, useState } from "react";
import { getFavorites, removeFavorite } from "../config/firebase";

// ✅ Definir el tipo `Movie` directamente aquí (ya que no tienes una carpeta `types/`)
interface Movie {
    id: number;
    title: string;
    poster?: string;
    rating?: number;
}

const Dashboard = () => {
    const [favorites, setFavorites] = useState<Movie[]>([]); // ✅ Ahora está bien tipado

    useEffect(() => {
        const fetchFavorites = async () => {
            const favs: Movie[] = await getFavorites(); // ✅ Forzar que `favs` sea `Movie[]`
            setFavorites(favs);
        };

        fetchFavorites();
    }, []);

    const handleRemoveFavorite = async (movieId: number) => { // ✅ Tipado correcto
        await removeFavorite(movieId);
        setFavorites(favorites.filter((movie) => movie.id !== movieId));
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-center text-white">🎬 Tus Favoritos</h1>
            {favorites.length === 0 ? (
                <p className="text-center text-gray-500 mt-4">Aún no tienes favoritos.</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                    {favorites.map((movie) => (
                        <div key={movie.id} className="bg-gray-800 text-white p-4 rounded-lg shadow-md">
                            <h2 className="text-lg font-semibold">{movie.title}</h2>
                            <button
                                onClick={() => handleRemoveFavorite(movie.id)}
                                className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                            >
                                ❌ Eliminar
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
