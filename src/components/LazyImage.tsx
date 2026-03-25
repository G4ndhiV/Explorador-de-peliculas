import React from "react";

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string; // ← Agregado como opcional
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className }) => {
    return <img src={src} alt={alt} loading="lazy" className={className} />;
};

export default LazyImage;