import { useEffect, useState, useContext, lazy, Suspense, ReactNode, Context } from "react";
import { FavoritesContext } from "../context/FavoritesContext";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Movie } from "./Home";
import { AuthContext } from "../context/AuthContext.tsx";
import ReviewForm from "../components/ReviewForm.tsx";
import { db } from "../config/firebase.tsx";
import { ContextProps } from "../context/FavoritesContext";
import { collection, query, where, getDocs } from "firebase/firestore";

const TMDB_API_KEY = "521b418e6b0c0227a624515e80c9288a";
const TMDB_API_URL = "https://api.themoviedb.org/3/movie";

interface Review {
    movieId: number;
    review: string;
    userName: string;
    userId: number;
}

export default function MovieDetails() {
    const LazyImage = lazy(() => import("../components/LazyImage"));
    const { id } = useParams();
    const [movie, setMovie] = useState<Movie | null>(null);
    const { setFavorite, favorites } = useContext<ContextProps>(FavoritesContext as Context<ContextProps>);
    const { user } = useContext(AuthContext);
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        axios
            .get(`${TMDB_API_URL}/${id}?api_key=${TMDB_API_KEY}`)
            .then((res) => setMovie(res.data))
            .catch((error) => console.error("Error fetching movie:", error));
    }, [id]);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!id) return;
            try {
                const reviewsRef = collection(db, "reviews");
                const q = query(reviewsRef, where("movieId", "==", parseInt(id, 10)));
                const snapshot = await getDocs(q);
                setReviews(snapshot.docs.map((doc) => doc.data() as Review));
            } catch (error) {
                console.error("Error fetching reviews:", error);
            }
        };
        fetchReviews();
    }, [id]);

    if (!movie) return <p className="text-center text-white mt-10 text-xl">Cargando...</p>;

    const isFavorite = favorites?.has(movie.id);
    let favButtonLabel = isFavorite ? "❌ Quitar de Favoritos" : "⭐ Agregar a Favoritos";

    return (
        <Suspense fallback={<div className="spinner"></div> as ReactNode}>
            <div className="min-h-screen bg-gray-900 text-white p-8">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6">
                    {/* Imagen de la película */}
                    <LazyImage
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        className="w-full md:w-72 rounded-lg shadow-lg"
                        alt={movie.title}
                    />

                    {/* Información de la película */}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-blue-400">{movie.title}</h1>
                        <p className="mt-2 text-gray-300">{movie.overview}</p>
                        <p className="mt-4 text-yellow-400 font-semibold">⭐ {movie.vote_average.toFixed(1)}</p>

                        <button
                            onClick={() => setFavorite?.(movie)}
                            className={`mt-4 w-full md:w-auto px-6 py-3 rounded-md text-white font-semibold transition-all 
                                ${isFavorite ? "bg-red-600 hover:bg-red-700" : "bg-green-500 hover:bg-green-600"}`}
                        >
                            {favButtonLabel}
                        </button>
                    </div>
                </div>

                {/* Sección de reseñas */}
                {user && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-center text-white">💬 Deja tu Reseña</h2>
                        <ReviewForm movieId={movie.id} />
                    </div>
                )}

                {reviews.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-center text-white">📝 Reseñas</h2>
                        <div className="mt-4 space-y-4">
                            {reviews.map((r, index) => (
                                <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md">
                                    <p className="text-lg">{r.review}</p>
                                    <p className="text-gray-400 text-sm mt-2">— {r.userName}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Suspense>
    );
}
