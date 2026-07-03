import { useState } from "react";
import { getImage } from "../services/imageService";

export default function Photo({ slot, width = 1200, className = "" }) {
  const { src, alt } = getImage(slot, { width });
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-surface-alt text-subtle text-sm ${className}`}
      >
        {alt}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-surface-alt ${className}`}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-surface-alt" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
