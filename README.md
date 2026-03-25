# 🎬 Movie Explorer

**Movie Explorer** es una aplicación web construida con React, TypeScript y Vite que permite explorar, buscar y visualizar información de películas. Está diseñada para ser rápida, interactiva y fácil de expandir, ideal para cinéfilos y desarrolladores que quieran practicar consumo de APIs de películas.

---

## 🌟 Objetivos

✅ Construir una aplicación React moderna usando Vite como entorno de desarrollo.  
✅ Integrar una API de películas (por ejemplo, OMDb API o The Movie Database) para obtener datos dinámicos.  
✅ Permitir búsquedas de películas por título, género o año.  
✅ Mostrar detalles de cada película, incluyendo póster, sinopsis, calificación y reparto.  
✅ Aplicar buenas prácticas de desarrollo con TypeScript, ESLint y componentes reutilizables.

---

## 🔧 Tecnologías usadas

- **React**  
- **TypeScript**  
- **Vite** (bundler rápido y ligero)  
- **ESLint** (para buenas prácticas y estilo de código)  
- **APIs de películas** (OMDb API, The Movie Database u otras)

---

## Configuración y seguridad

Las claves de **TMDB** y **Firebase** no deben estar en el código. Copia `.env.example` a `.env` y rellena los valores:

```bash
cp .env.example .env
```

- **TMDB**: [API Settings](https://www.themoviedb.org/settings/api)
- **Firebase**: consola del proyecto → Configuración → Tus apps (SDK web)

En **Vercel** (u otro host), define las mismas variables `VITE_*` en *Environment Variables* para producción.

> Las claves de Firebase en el cliente son públicas por diseño; la protección real viene de **reglas de Firestore** y **dominios autorizados** en la consola de Firebase. Si alguna clave llegó a subirse al historial de git, conviene **rotarla** en la consola.

---

