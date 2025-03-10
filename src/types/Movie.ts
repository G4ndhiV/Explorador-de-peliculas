export interface Movie {
    id: number;
    title: string;
    poster?: string;  // ✅ Asegurar que `poster` existe y es opcional
    rating?: number;
}
