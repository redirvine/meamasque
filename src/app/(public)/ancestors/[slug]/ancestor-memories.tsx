"use client";

import { useState, useCallback, useEffect } from "react";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Memory = {
  id: string;
  content: string;
  sortOrder: number;
};

export function AncestorMemories({
  ancestorId,
  ancestorName,
  memoryCount,
}: {
  ancestorId: string;
  ancestorName: string;
  memoryCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const openViewer = useCallback(async () => {
    setOpen(true);
    setLoading(true);
    setIndex(0);
    try {
      const res = await fetch(`/api/ancestors/${ancestorId}/memories`);
      if (res.ok) {
        setMemories(await res.json());
      }
    } catch {
      setMemories([]);
    } finally {
      setLoading(false);
    }
  }, [ancestorId]);

  const prev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : memories.length - 1));
  }, [memories.length]);

  const next = useCallback(() => {
    setIndex((i) => (i < memories.length - 1 ? i + 1 : 0));
  }, [memories.length]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, prev, next]);

  return (
    <>
      <div className="mt-8">
        <button
          onClick={openViewer}
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          <BookOpen className="h-4 w-4" />
          {memoryCount} {memoryCount === 1 ? "memory" : "memories"}
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Memories &mdash; {ancestorName}</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            </div>
          ) : memories.length > 0 ? (
            <div className="relative">
              <div className="min-h-[8rem] rounded-lg bg-gray-50 p-4">
                <p className="whitespace-pre-wrap text-sm text-gray-700">
                  {memories[index]?.content}
                </p>
              </div>
              {memories.length > 1 && (
                <div className="mt-3 flex items-center justify-center gap-4">
                  <button
                    onClick={prev}
                    className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Previous memory"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-sm text-gray-500">
                    {index + 1} / {memories.length}
                  </span>
                  <button
                    onClick={next}
                    className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Next memory"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No memories yet.</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
