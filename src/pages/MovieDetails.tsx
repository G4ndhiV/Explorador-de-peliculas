import { useEffect, useState, useContext, lazy, Suspense, ReactNode , Context} from "react";
import { FavoritesContext } from "../context/FavoritesContext";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Movie } from "./Home";
import { AuthContext } from "../context/AuthContext.tsx";
import ReviewForm from "../components/ReviewForm.tsx";
import { db } from "../config/firebase.tsx";
import {ContextProps} from "../context/FavoritesContext";
import { collection, query, where, getDocs } from "firebase/firestore";

const TMDB_API_KEY = '521b418e6b0c0227a624515e80c9288a';
const TMDB_API_URL = 'https://api.themoviedb.org/3/movie';

interface Review{
    movieId: number;
    review: string;
    userName: string;
    userId: number;
}

export default function MovieDetails() {
    const LazyImage = lazy(() => import("../components/LazyImage"));
    const { id } = useParams();
    const [movie, setMovie] = useState<Movie | null>(null);
    const { setFavorite,favorites } = useContext<ContextProps>(FavoritesContext as Context<ContextProps>);
    const { user } = useContext(AuthContext);
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        axios.get(`${TMDB_API_URL}/${id}?api_key=${TMDB_API_KEY}`)
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

    if (!movie) return <p>Loading...</p>;

    let favButtonLabel = favorites?.has(movie.id) ? 'Remove from Favorites' : 'Add to Favorites';

    return (
        <Suspense fallback={<div className="spinner"></div> as ReactNode}>
            <div className="p-4">
                {/* Imagen usando LazyImage */}
                <LazyImage
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    className="w-64 rounded"
                    alt={movie.title}
                />

                <h1 className="text-2xl font-bold">{movie.title}</h1>
                <p>{movie.overview}</p>
                <p>⭐ {movie.vote_average}</p>
                <button
                    onClick={() => setFavorite?.(movie)}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    {favButtonLabel}
                </button>

                {user && <ReviewForm movieId={movie.id} />}

                {reviews.length > 0 && (
                    <div className="p-4">
                        <h1>Reviews</h1>
                        {reviews.map((r, index) => (
                            <p key={index} className="text-right">
                                <strong>{r.review}</strong><br />by: {r.userName}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </Suspense>
    );
}