"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SWIPE_THRESHOLD = 40;

type ImageCarouselProps = {
  images: string[];
  alt: string;
  /** `cover` fills and crops; `contain` shows the whole image. */
  fit?: "cover" | "contain";
  /** Extra classes for each image, e.g. hover effects. */
  imageClassName?: string;
};

// Stop control clicks from reaching a wrapping <Link>.
const swallow = (e: React.SyntheticEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

// Falls back to a single static image when there's nothing to slide through.
export function ImageCarousel({
  images,
  alt,
  fit = "cover",
  imageClassName = " group-hover:scale-105",
}: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const swiped = useRef(false);
  const count = images.length;
  const fitClass = fit === "contain" ? "object-contain" : "object-cover";

  if (count <= 1) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- API-hosted image, no remotePatterns configured
      <img src={images[0]} alt={alt} className={`h-full w-full ${fitClass} ${imageClassName}`} />
    );
  }

  const go = (next: number) => setIndex((next + count) % count);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      role="region"
      aria-roledescription="carousel"
      aria-label={`${alt} images`}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(index - 1);
        if (e.key === "ArrowRight") go(index + 1);
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
        swiped.current = false;
      }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > SWIPE_THRESHOLD) {
          swiped.current = true;
          go(index + (dx < 0 ? 1 : -1));
        }
        touchX.current = null;
      }}
      // A swipe ends with a click; don't let it open the product link.
      onClickCapture={(e) => {
        if (swiped.current) {
          swallow(e);
          swiped.current = false;
        }
      }}
    >
      <div className="flex h-full transition-transform duration-500 ease-brand" style={{ transform: `translateX(-${index * 100}%)` }}>
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- API-hosted image, no remotePatterns configured
          <img
            key={src + i}
            src={src}
            alt={`${alt}, image ${i + 1} of ${count}`}
            aria-hidden={i !== index}
            loading={i === 0 ? "eager" : "lazy"}
            draggable={false}
            className={`h-full w-full shrink-0 ${fitClass}`}
          />
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous image"
        onClick={(e) => {
          swallow(e);
          go(index - 1);
        }}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-text-secondary opacity-0 shadow transition-opacity hover:text-primary focus-visible:opacity-100 group-hover:opacity-100"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Next image"
        onClick={(e) => {
          swallow(e);
          go(index + 1);
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-text-secondary opacity-0 shadow transition-opacity hover:text-primary focus-visible:opacity-100 group-hover:opacity-100"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 backdrop-blur">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show image ${i + 1}`}
            aria-current={i === index}
            onClick={(e) => {
              swallow(e);
              setIndex(i);
            }}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-white" : "w-1.5 bg-white/60 hover:bg-white/90"}`}
          />
        ))}
      </div>
    </div>
  );
}
