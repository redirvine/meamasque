"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  const [dialogOpen, setDialogOpen] = useState(false);

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
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden">
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
          onClick={() => setDialogOpen(true)}
          className="max-h-full max-w-full cursor-pointer object-contain"
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

      <div className="shrink-0 py-2 text-center">
        <h2 className="text-lg font-semibold">{image.title}</h2>
        <div className="mt-0.5 flex items-center justify-center gap-2 text-sm text-gray-500">
          {image.creatorName && <span>{image.creatorName}</span>}
          {image.creatorName && image.dateCreated && <span>&middot;</span>}
          {image.dateCreated && <span>{image.dateCreated}</span>}
          {images.length > 1 && (
            <>
              <span>&middot;</span>
              <span>{index + 1} / {images.length}</span>
            </>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{image.title}</DialogTitle>
            {(image.creatorName || image.dateCreated) && (
              <DialogDescription>
                {image.creatorName}
                {image.creatorName && image.dateCreated && " \u00b7 "}
                {image.dateCreated}
              </DialogDescription>
            )}
          </DialogHeader>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.blobUrl}
            alt={image.title}
            className="w-full rounded-md"
          />
          {image.description && (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {image.description}
            </p>
          )}
          {isAdmin && (
            <div className="flex justify-end">
              <Link
                href={`/admin/images/${image.id}/edit${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Link>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
