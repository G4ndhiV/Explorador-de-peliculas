import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import NavBar from './components/NavBar.tsx';
import MovieDetails from "./pages/MovieDetails.tsx";
import Favorites from "./pages/Favorites.tsx";
import Signup from "./pages/Signup.tsx";  // ✅ Agregado
import Login from "./pages/Login.tsx";    // ✅ Agregado
import ProtectedRoute from "./components/ProtectedRoute.tsx";

import './App.css';

export default function App() {
    return (
        <div>
            <NavBar/>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/dashboard" element={
                    <ProtectedRoute><Dashboard /></ProtectedRoute>}
                />
                <Route path="/profile" element={
                    <ProtectedRoute><Profile /></ProtectedRoute>}
                />
                <Route path="/movie/:id" element={<MovieDetails />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/signup" element={<Signup />} />   {/* ✅ Nueva ruta */}
                <Route path="/login" element={<Login />} />     {/* ✅ Nueva ruta */}
            </Routes>
        </div>
    );
}