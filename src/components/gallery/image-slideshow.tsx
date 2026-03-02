"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface SlideshowImage {
  id: string;
  title: string;
  blobUrl: string;
  creatorName: string | null;
}

export function ImageSlideshow({ images }: { images: SlideshowImage[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev]);

  if (images.length === 0) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center text-gray-500">
        <p>No artwork to display yet.</p>
      </div>
    );
  }

  const current = images[currentIndex];
  const prevIndex = (currentIndex - 1 + images.length) % images.length;
  const nextIndex = (currentIndex + 1) % images.length;

  return (
    <div className="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-black">
      {/* Images with crossfade */}
      {images.map((image, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={image.id}
          src={image.blobUrl}
          alt={image.title}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            i === currentIndex ? "opacity-100" : "opacity-0"
          }`}
          loading={
            i === currentIndex || i === prevIndex || i === nextIndex
              ? "eager"
              : "lazy"
          }
        />
      ))}

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/50 hover:text-white"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/50 hover:text-white"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Bottom gradient overlay with info */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-6 pb-6 pt-20">
        <div className="flex items-end justify-between">
          <Link
            href={`/gallery/${current.id}`}
            className="group text-white transition-colors hover:text-white/80"
          >
            <h2 className="text-xl font-semibold group-hover:underline">
              {current.title}
            </h2>
            {current.creatorName && (
              <p className="mt-1 text-sm text-white/70">
                {current.creatorName}
              </p>
            )}
          </Link>
          <span className="text-sm text-white/60">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      </div>
    </div>
  );
}
