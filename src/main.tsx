import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import {FavoritesProvider} from "./context/FavoritesContext.tsx";
import {AuthProvider} from "./context/AuthContext.tsx";

import './index.css'
import App from './App'
import React from 'react'


createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <FavoritesProvider>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </FavoritesProvider>
        </BrowserRouter>
    </React.StrictMode>

);