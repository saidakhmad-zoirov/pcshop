"use client";
import { useState } from "react";
import CategoryIcon from "./CategoryIcon";

/** Google'dan olingan rasm ochilmasa — turkum ikonkasi ko'rsatiladi. */
export default function ProductImage({
  src, alt, category, className = "",
}: { src: string | null; alt: string; category: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-bench/60 ${className}`}>
        <CategoryIcon slug={category} className="h-1/3 w-1/3 text-rail" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`bg-white object-contain p-3 ${className}`}
    />
  );
}
