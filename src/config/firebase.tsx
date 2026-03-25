import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { Movie } from "../types/Movie";

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (import.meta.env.PROD) {
  const required: (keyof FirebaseOptions)[] = [
    "apiKey",
    "authDomain",
    "projectId",
    "appId",
  ];
  const missing = required.filter((k) => !firebaseConfig[k]);
  if (missing.length) {
    console.error(
      "[CineScope] Faltan variables VITE_FIREBASE_* en el entorno de producción:",
      missing.join(", ")
    );
  }
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const saveFavorite = async (movie: Movie): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const favRef = doc(db, "favorites", `${user.uid}_${movie.id}`);
    await setDoc(favRef, { userId: user.uid, ...movie });
    if (import.meta.env.DEV) {
      console.log("Favorito guardado:", movie.title);
    }
  } catch (error) {
    console.error("Error al guardar favorito:", error);
  }
};

export const getFavorites = async (): Promise<Movie[]> => {
  const user = auth.currentUser;
  if (!user) return [];
  try {
    const q = query(collection(db, "favorites"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((d) => d.data() as Movie);
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    return [];
  }
};

export const removeFavorite = async (movieId: number): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await deleteDoc(doc(db, "favorites", `${user.uid}_${movieId}`));
  } catch (error) {
    console.error("Error al eliminar favorito:", error);
  }
};
