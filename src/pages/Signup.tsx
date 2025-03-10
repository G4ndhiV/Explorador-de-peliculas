import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase.tsx";
import { useNavigate } from "react-router-dom";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault();
        try {
            const resp = await createUserWithEmailAndPassword(auth, email, password);
            alert(`✅ Usuario ${email} creado exitosamente!`);
            navigate('/login');
            return resp.user.uid;
        } catch (e) {
            setError((e as Error).message);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold text-white mb-4 text-center">Registro</h2>

                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                <form onSubmit={handleSignup} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Correo Electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:border-blue-400"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:border-blue-400"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-all"
                    >
                        Crear Cuenta
                    </button>
                </form>

                <p className="text-gray-400 text-sm text-center mt-4">
                    ¿Ya tienes cuenta?{" "}
                    <a href="/login" className="text-blue-400 hover:underline">Inicia sesión</a>
                </p>
            </div>
        </div>
    );
}
