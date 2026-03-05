"use client";

import { useState, useEffect, useCallback } from "react";
import { Camera, BookOpen, Drama, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

      <Dialog
        open={selectedIndex !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedIndex(null);
            setItems([]);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {loading ? (
            <>
              <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogDescription>Loading…</DialogDescription>
              </DialogHeader>
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              </div>
            </>
          ) : current ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {current.type === "image"
                    ? current.data.title || dialogTitle
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
                    alt={current.data.title || dialogTitle}
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
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
