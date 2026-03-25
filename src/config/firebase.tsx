import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc, query, where } from "firebase/firestore";
import { Movie } from "../types/Movie"; // ✅ Importa Movie correctamente

// ✅ Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB9of4pBCICDHQeaRmEs3AdEUeKB6DISmA",
    authDomain: "movie-explorer-29aae.firebaseapp.com",
    projectId: "movie-explorer-29aae",
    storageBucket: "movie-explorer-29aae.firebasestorage.app",
    messagingSenderId: "126800380553",
    appId: "1:126800380553:web:b8af78a97c422758d9bc58",
};

// ✅ Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ Guardar una película como favorita
export const saveFavorite = async (movie: Movie): Promise<void> => {
    const user = auth.currentUser;
    if (!user) return;
    try {
        const favRef = doc(db, "favorites", `${user.uid}_${movie.id}`);
        await setDoc(favRef, { userId: user.uid, ...movie });
        console.log("🔥 Favorito guardado:", movie.title);
    } catch (error) {
        console.error("❌ Error al guardar favorito:", error);
    }
};

// ✅ Obtener películas favoritas del usuario autenticado
export const getFavorites = async (): Promise<Movie[]> => {
    const user = auth.currentUser;
    if (!user) return [];
    try {
        const q = query(collection(db, "favorites"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => doc.data() as Movie); // ✅ Tipar correctamente el retorno
    } catch (error) {
        console.error("❌ Error al obtener favoritos:", error);
        return [];
    }
};

// ✅ Eliminar una película de favoritos
export const removeFavorite = async (movieId: number): Promise<void> => {
    const user = auth.currentUser;
    if (!user) return;
    try {
        await deleteDoc(doc(db, "favorites", `${user.uid}_${movieId}`));
        console.log("🗑️ Favorito eliminado:", movieId);
    } catch (error) {
        console.error("❌ Error al eliminar favorito:", error);
    }
};
