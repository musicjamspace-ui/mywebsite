"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const AUTO_INTERVAL_MS = 5000;

type Props = {
  images: string[];
  alt: string;
  className?: string;
};

export default function StoreProductGallery({ images, alt, className }: Props) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const n = images.length;

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + n) % n);
  }, [n]);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % n);
  }, [n]);

  useEffect(() => {
    if (n <= 1 || hovered) return;
    const t = setInterval(goNext, AUTO_INTERVAL_MS);
    return () => clearInterval(t);
  }, [n, hovered, goNext]);

  if (n === 0) return null;

  const src = images[index]!;

  return (
    <div
      className={cn(
        "group/gallery relative overflow-hidden rounded-lg border border-border bg-muted",
        "aspect-[4/3] sm:aspect-[16/11] lg:aspect-square max-h-[min(72vh,560px)]",
        className,
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative h-full w-full min-h-[220px] overflow-hidden">
        <Image
          key={`${src}-${index}`}
          src={src}
          alt={`${alt} — ${index + 1} of ${n}`}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover/gallery:scale-[1.08] motion-reduce:group-hover/gallery:scale-100"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={index === 0}
        />
      </div>

      {n > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous image"
            className={cn(
              "absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full",
              "bg-background/85 text-foreground shadow-md backdrop-blur-sm",
              "transition-opacity duration-200 hover:bg-background",
              "opacity-85 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "md:opacity-0 md:group-hover/gallery:opacity-100 md:group-focus-within/gallery:opacity-100",
            )}
            onClick={(e) => {
              e.preventDefault();
              goPrev();
            }}
          >
            <ChevronLeft className="h-6 w-6" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next image"
            className={cn(
              "absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full",
              "bg-background/85 text-foreground shadow-md backdrop-blur-sm",
              "transition-opacity duration-200 hover:bg-background",
              "opacity-85 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "md:opacity-0 md:group-hover/gallery:opacity-100 md:group-focus-within/gallery:opacity-100",
            )}
            onClick={(e) => {
              e.preventDefault();
              goNext();
            }}
          >
            <ChevronRight className="h-6 w-6" aria-hidden />
          </button>
          <div
            className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 md:opacity-0 md:transition-opacity md:duration-200 md:group-hover/gallery:opacity-100"
            aria-hidden
          >
            {images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  i === index ? "bg-primary" : "bg-background/70 ring-1 ring-border",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
