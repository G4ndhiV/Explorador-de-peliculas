import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../config/firebase.tsx";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const { user } = useContext(AuthContext);
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            const userRef = doc(db, "users", user.uid);
            getDoc(userRef).then((docSnap) => {
                if (docSnap.exists()) {
                    setUsername(docSnap.data().username);
                    setBio(docSnap.data().bio);
                }
            });
        }
    }, [user]);

    async function handleSave() {
        if (user) {
            try {
                await setDoc(doc(db, "users", user.uid), { username, bio });
                alert("✅ Perfil actualizado exitosamente!");
                navigate("/profile");
            } catch (e) {
                alert("❌ Error: " + (e as Error).message);
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96 text-white">
                <h1 className="text-2xl font-bold text-center mb-6">Editar Perfil</h1>

                <label className="block text-gray-400 text-sm mb-2">Nombre de Usuario</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ingresa tu nombre de usuario"
                    className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:border-blue-400 mb-4"
                />

                <label className="block text-gray-400 text-sm mb-2">Biografía</label>
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Escribe algo sobre ti..."
                    className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:border-blue-400 mb-4 h-24"
                />

                <button
                    onClick={handleSave}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-all"
                >
                    💾 Guardar Cambios
                </button>
            </div>
        </div>
    );
}
