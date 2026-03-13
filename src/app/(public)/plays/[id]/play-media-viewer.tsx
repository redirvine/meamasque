"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface PlayImage {
  id: string;
  blobUrl: string;
  title: string;
  caption: string | null;
}

interface PlayMemory {
  id: string;
  content: string;
}

type MediaItem =
  | { type: "image"; data: PlayImage }
  | { type: "memory"; data: PlayMemory };

export function PlayMediaViewer({
  images,
  memories,
  playTitle,
}: {
  images: PlayImage[];
  memories: PlayMemory[];
  playTitle: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  const items: MediaItem[] = [
    ...images.map((img) => ({ type: "image" as const, data: img })),
    ...memories.map((mem) => ({ type: "memory" as const, data: mem })),
  ];

  const prevPhoto = useCallback(() => {
    setPhotoIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  }, [images.length]);

  const nextPhoto = useCallback(() => {
    setPhotoIndex((i) => (i < images.length - 1 ? i + 1 : 0));
  }, [images.length]);

  const goNext = useCallback(() => {
    setSelectedIndex((i) => (i !== null ? (i + 1) % items.length : null));
  }, [items.length]);

  const goPrev = useCallback(() => {
    setSelectedIndex((i) =>
      i !== null ? (i - 1 + items.length) % items.length : null
    );
  }, [items.length]);

  useEffect(() => {
    if (selectedIndex === null) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, goNext, goPrev]);

  const current = selectedIndex !== null ? items[selectedIndex] : null;

  return (
    <>
      {images.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Photos</h2>
          <div className="relative">
            <button
              type="button"
              onClick={() => setSelectedIndex(photoIndex)}
              className="w-full cursor-pointer overflow-hidden rounded-lg transition-shadow hover:shadow-lg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[photoIndex].blobUrl}
                alt={images[photoIndex].title || playTitle}
                className="w-full rounded-lg object-cover"
              />
            </button>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={nextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
            <span>
              {images[photoIndex].caption ?? ""}
            </span>
            {images.length > 1 && (
              <span>{photoIndex + 1} / {images.length}</span>
            )}
          </div>
        </div>
      )}

      {memories.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Memories</h2>
          <div className="space-y-4">
            {memories.map((memory, i) => (
              <button
                key={memory.id}
                type="button"
                onClick={() => setSelectedIndex(images.length + i)}
                className="w-full cursor-pointer rounded-lg bg-gray-50 p-4 text-left transition-shadow hover:shadow-md"
              >
                <p className="whitespace-pre-wrap text-sm text-gray-700">
                  {memory.content}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      <Dialog
        open={selectedIndex !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedIndex(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {current && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {current.type === "image"
                    ? current.data.title || playTitle
                    : "Memory"}
                </DialogTitle>
                <DialogDescription>
                  {selectedIndex !== null && `${selectedIndex + 1} / ${items.length}`}
                </DialogDescription>
              </DialogHeader>

              {current.type === "image" ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={current.data.blobUrl}
                    alt={current.data.title || playTitle}
                    className="w-full rounded-md"
                  />
                  {current.data.caption && (
                    <p className="text-sm text-gray-500">{current.data.caption}</p>
                  )}
                </>
              ) : (
                <div className="rounded-lg bg-gray-50 p-6">
                  <p className="whitespace-pre-wrap text-gray-700">
                    {current.data.content}
                  </p>
                </div>
              )}

              {items.length > 1 && (
                <div className="flex justify-between pt-2">
                  <button
                    onClick={goPrev}
                    className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={goNext}
                    className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Next"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
