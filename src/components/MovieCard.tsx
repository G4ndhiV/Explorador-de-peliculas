import { Link } from "react-router-dom";
import { lazy, Suspense, useContext } from "react";
import { FavoritesContext } from "../context/FavoritesContext";

const LazyImage = lazy(() => import("./LazyImage"));

interface MovieProps {
    title: string;
    poster: string;
    rating: number;
    id: number;
}

export default function MovieCard({ id, title, poster, rating }: MovieProps) {
    const favoritesContext = useContext(FavoritesContext);
    if (!favoritesContext) return null;

    const { favorites, setFavorite } = favoritesContext;
    const isFavorite = favorites.has(id);

    return (
        <Suspense fallback={<div className="spinner"></div>}>
            <div className="p-4 bg-gray-900 text-white rounded-lg shadow-md">
                <LazyImage src={poster} alt={title} className="w-full rounded" />
                <h3 className="text-lg font-bold mt-2">
                    <Link to={`/movie/${id}`} className="hover:text-blue-400">{title}</Link>
                </h3>
                <p>⭐ {rating}</p>
                <button
                    onClick={() => setFavorite({ id, title, poster, rating })}
                    className={`mt-3 px-4 py-2 rounded-md w-full 
                    ${isFavorite ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
                >
                    {isFavorite ? "❌ Quitar de Favoritos" : "⭐ Agregar a Favoritos"}
                </button>
            </div>
        </Suspense>
    );
}
