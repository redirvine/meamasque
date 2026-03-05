"use client";

import { useState, useEffect, useCallback } from "react";
import { Camera, BookOpen, Drama, Pencil, ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";

type Play = {
  id: string;
  play: string;
  role: string | null;
  location: string | null;
  description: string | null;
  year: number | null;
  primaryImageUrl: string | null;
  primaryImageThumbnailUrl?: string | null;
  imageCount: number;
  memoryCount: number;
};

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

export function PlaysListing({ plays, isAdmin = false }: { plays: Play[]; isAdmin?: boolean }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [dialogTitle, setDialogTitle] = useState("");
  const [loading, setLoading] = useState(false);

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

  async function openMedia(play: Play, startAt: "photos" | "memories") {
    setLoading(true);
    setDialogTitle(play.play);
    setSelectedIndex(0);

    try {
      const res = await fetch(`/api/plays/${play.id}`);
      const data = await res.json();
      const imgs: MediaItem[] = (data.images ?? []).map((img: PlayImage) => ({
        type: "image" as const,
        data: img,
      }));
      const mems: MediaItem[] = (data.memories ?? []).map((mem: PlayMemory) => ({
        type: "memory" as const,
        data: mem,
      }));
      const allItems = [...imgs, ...mems];
      setItems(allItems);
      setSelectedIndex(startAt === "memories" ? imgs.length : 0);
    } catch {
      setSelectedIndex(null);
    } finally {
      setLoading(false);
    }
  }

  const current = selectedIndex !== null ? items[selectedIndex] : null;

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {plays.map((p) => (
          <div
            key={p.id}
            className="group relative flex flex-col overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
          >
            {/* Card link covers the entire card */}
            <Link
              href={`/plays/${p.id}`}
              className="absolute inset-0 z-0"
              aria-label={p.play}
            />
            {isAdmin && (
              <span className="absolute top-2 right-2 z-10">
                <Link
                  href={`/admin/plays?edit=${p.id}`}
                  className="rounded-full bg-white/80 p-1.5 text-gray-400 shadow transition-colors hover:bg-white hover:text-gray-700"
                  title="Edit play"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
              </span>
            )}
            {p.primaryImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.primaryImageThumbnailUrl ?? p.primaryImageUrl}
                alt={p.play}
                className="aspect-[3/2] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[3/2] w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <Drama className="h-12 w-12 text-gray-300" />
              </div>
            )}
            <div className="flex flex-1 flex-col p-4">
              <h2 className="text-lg font-semibold">{p.play}</h2>
              {p.role && (
                <p className="text-sm text-gray-600">{p.role}</p>
              )}
              <div className="mt-1 flex gap-2 text-sm text-gray-500">
                {p.year != null && <span>{p.year}</span>}
                {p.year != null && p.location && <span>&middot;</span>}
                {p.location && <span>{p.location}</span>}
              </div>
              {p.description && (
                <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm text-gray-700">
                  {p.description}
                </p>
              )}
              {(p.imageCount > 0 || p.memoryCount > 0) && (
                <div className="relative z-10 mt-auto flex gap-3 pt-3">
                  {p.imageCount > 0 && (
                    <button
                      type="button"
                      onClick={() => openMedia(p, "photos")}
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      {p.imageCount} {p.imageCount === 1 ? "photo" : "photos"}
                    </button>
                  )}
                  {p.memoryCount > 0 && (
                    <button
                      type="button"
                      onClick={() => openMedia(p, "memories")}
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      {p.memoryCount} {p.memoryCount === 1 ? "memory" : "memories"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Image lightbox - black background, centered arrows */}
      <Dialog
        open={selectedIndex !== null && (loading || current?.type === "image")}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedIndex(null);
            setItems([]);
          }
        }}
      >
        <DialogContent
          className="max-w-[90vw] max-h-[90vh] sm:max-w-[90vw] p-0 border-none bg-black/95 overflow-hidden"
          showCloseButton={false}
        >
          <VisuallyHidden.Root>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </VisuallyHidden.Root>
          <DialogClose className="absolute top-3 right-3 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          ) : current?.type === "image" ? (
            <div className="relative flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.data.blobUrl}
                alt={current.data.title || dialogTitle}
                className="max-h-[80vh] max-w-full object-contain"
              />
              {items.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                    aria-label="Next"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8">
                {items.length > 1 && (
                  <p className="text-center text-sm text-white/80">
                    {selectedIndex !== null ? selectedIndex + 1 : 0} / {items.length}
                  </p>
                )}
                {current.data.caption && (
                  <p className="mt-1 text-center text-sm text-white/90">
                    {current.data.caption}
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Memory dialog - white card style */}
      <Dialog
        open={selectedIndex !== null && !loading && current?.type === "memory"}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedIndex(null);
            setItems([]);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {current?.type === "memory" && (
            <>
              <DialogHeader>
                <DialogTitle>Memory</DialogTitle>
                <DialogDescription>
                  {selectedIndex !== null && `${selectedIndex + 1} / ${items.length}`}
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-lg bg-gray-50 p-6">
                <p className="whitespace-pre-wrap text-gray-700">
                  {current.data.content}
                </p>
              </div>
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
