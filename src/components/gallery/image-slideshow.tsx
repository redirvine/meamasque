"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";

interface SlideshowImage {
  id: string;
  title: string;
  blobUrl: string;
  dateCreated: string | null;
  creatorName?: string | null;
  description?: string | null;
}

export function ImageSlideshow({ images, isAdmin = false, redirectPath }: { images: SlideshowImage[]; isAdmin?: boolean; redirectPath?: string }) {
  const [index, setIndex] = useState(0);

  const prev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setIndex((i) => (i < images.length - 1 ? i + 1 : 0));
  }, [images.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prev, next]);

  if (images.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500">
        <p>No artwork to display yet.</p>
      </div>
    );
  }

  const image = images[index];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-3xl">
        {isAdmin && (
          <Link
            href={`/admin/images/${image.id}/edit${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
            className="absolute top-3 right-3 z-10 rounded-full bg-white/80 p-1.5 text-gray-500 shadow transition-colors hover:bg-white hover:text-gray-700"
            title="Edit image"
          >
            <Pencil className="h-4 w-4" />
          </Link>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.blobUrl}
          alt={image.title}
          className="w-full rounded-lg object-contain"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      <div className="mt-4 text-center">
        <h2 className="text-xl font-semibold">{image.title}</h2>
        <div className="mt-1 flex items-center justify-center gap-2 text-sm text-gray-500">
          {image.creatorName && <span>{image.creatorName}</span>}
          {image.creatorName && image.dateCreated && <span>&middot;</span>}
          {image.dateCreated && <span>{image.dateCreated}</span>}
        </div>
        {image.description && (
          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-700 whitespace-pre-wrap">
            {image.description}
          </p>
        )}
      </div>

      {images.length > 1 && (
        <p className="mt-4 text-xs text-gray-400">
          {index + 1} / {images.length}
        </p>
      )}
    </div>
  );
}
