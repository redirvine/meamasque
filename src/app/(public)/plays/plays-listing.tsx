"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";

type Play = {
  id: string;
  play: string;
  date: string | null;
  role: string | null;
  location: string | null;
  description: string | null;
  year: number | null;
  primaryImageUrl: string | null;
};

type PlayImage = {
  id: string;
  blobUrl: string;
  title: string | null;
  caption: string | null;
  sortOrder: number;
};

export function PlaysListing({ plays }: { plays: Play[] }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<PlayImage[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const openLightbox = useCallback(async (play: Play) => {
    if (!play.primaryImageUrl) return;

    setLightboxTitle(play.play);
    setLightboxOpen(true);
    setLoading(true);
    setLightboxIndex(0);

    try {
      const res = await fetch(`/api/plays/${play.id}/images`);
      if (res.ok) {
        const imgs: PlayImage[] = await res.json();
        setLightboxImages(
          imgs.length > 0
            ? imgs
            : [{ id: "primary", blobUrl: play.primaryImageUrl!, title: play.play, caption: null, sortOrder: 0 }]
        );
      } else {
        // Fallback to just the primary image
        setLightboxImages([
          { id: "primary", blobUrl: play.primaryImageUrl!, title: play.play, caption: null, sortOrder: 0 },
        ]);
      }
    } catch {
      setLightboxImages([
        { id: "primary", blobUrl: play.primaryImageUrl!, title: play.play, caption: null, sortOrder: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const prev = useCallback(() => {
    setLightboxIndex((i) => (i > 0 ? i - 1 : lightboxImages.length - 1));
  }, [lightboxImages.length]);

  const next = useCallback(() => {
    setLightboxIndex((i) => (i < lightboxImages.length - 1 ? i + 1 : 0));
  }, [lightboxImages.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, prev, next]);

  const currentImage = lightboxImages[lightboxIndex];

  return (
    <>
      <div className="space-y-4">
        {plays.map((p) => (
          <div key={p.id} className="flex gap-5 rounded-lg border p-4">
            {p.primaryImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.primaryImageUrl}
                alt={p.play}
                className="h-32 w-32 flex-shrink-0 cursor-pointer rounded-md object-cover transition-opacity hover:opacity-80"
                onClick={() => openLightbox(p)}
              />
            ) : (
              <div className="h-32 w-32 flex-shrink-0 rounded-md bg-gray-100" />
            )}
            <div className="min-w-0">
              <h2 className="text-lg font-semibold">{p.play}</h2>
              {p.role && (
                <p className="text-sm text-gray-600">{p.role}</p>
              )}
              {(p.year != null || p.date) && (
                <p className="mt-1 text-sm text-gray-500">
                  {p.year ?? p.date}
                </p>
              )}
              {p.location && (
                <p className="text-sm text-gray-500">{p.location}</p>
              )}
              {p.description && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                  {p.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-[90vw] max-h-[90vh] sm:max-w-[90vw] p-0 border-none bg-black/95 overflow-hidden"
          showCloseButton={false}
        >
          <VisuallyHidden.Root>
            <DialogTitle>{lightboxTitle}</DialogTitle>
          </VisuallyHidden.Root>
          <DialogClose className="absolute top-3 right-3 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          ) : currentImage ? (
            <div className="relative flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentImage.blobUrl}
                alt={currentImage.title || lightboxTitle}
                className="max-h-[80vh] max-w-full object-contain"
              />

              {lightboxImages.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8">
                {lightboxImages.length > 1 && (
                  <p className="text-center text-sm text-white/80">
                    {lightboxIndex + 1} / {lightboxImages.length}
                  </p>
                )}
                {currentImage.caption && (
                  <p className="mt-1 text-center text-sm text-white/90">
                    {currentImage.caption}
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
