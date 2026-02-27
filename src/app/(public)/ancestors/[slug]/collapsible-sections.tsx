"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AncestorMemories } from "./ancestor-memories";
import { ImageGrid } from "@/components/gallery/image-grid";

type PhotoGroup = {
  categoryName: string;
  images: {
    id: string;
    title: string;
    blobUrl: string;
    dateCreated: string | null;
  }[];
};

export function CollapsibleSections({
  bio,
  memoryCount,
  ancestorId,
  ancestorName,
  photoGroups,
  isAdmin,
}: {
  bio: string | null;
  memoryCount: number;
  ancestorId: string;
  ancestorName: string;
  photoGroups: PhotoGroup[];
  isAdmin: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [allOpen, setAllOpen] = useState(true);

  const hasSections = !!bio || memoryCount > 0 || photoGroups.length > 0;

  function toggleAll() {
    const next = !allOpen;
    setAllOpen(next);
    containerRef.current
      ?.querySelectorAll("details")
      .forEach((el) => (el.open = next));
  }

  if (!hasSections) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={toggleAll}
        className="absolute right-0 top-10 text-sm text-gray-500 hover:text-gray-700"
      >
        {allOpen ? "Collapse All" : "Expand All"}
      </button>

      {bio && (
        <details className="mt-8 group" open>
          <summary className="mb-3 flex cursor-pointer list-none items-center gap-2 text-xl font-semibold [&::-webkit-details-marker]:hidden">
            <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-0 -rotate-90" />
            Biography
          </summary>
          <div className="prose prose-gray max-w-none whitespace-pre-wrap text-gray-700">
            {bio}
          </div>
        </details>
      )}

      {memoryCount > 0 && (
        <details className="mt-8 group" open>
          <summary className="mb-3 flex cursor-pointer list-none items-center gap-2 text-xl font-semibold [&::-webkit-details-marker]:hidden">
            <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-0 -rotate-90" />
            Memories
            <span className="text-sm font-normal text-gray-500">
              ({memoryCount})
            </span>
          </summary>
          <AncestorMemories
            ancestorId={ancestorId}
            ancestorName={ancestorName}
            memoryCount={memoryCount}
          />
        </details>
      )}

      {photoGroups.map(({ categoryName, images }) => (
        <details key={categoryName} className="mt-8 group" open>
          <summary className="mb-4 flex cursor-pointer list-none items-center gap-2 text-xl font-semibold [&::-webkit-details-marker]:hidden">
            <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-0 -rotate-90" />
            {categoryName}
            <span className="text-sm font-normal text-gray-500">
              ({images.length})
            </span>
          </summary>
          <ImageGrid images={images} isAdmin={isAdmin} />
        </details>
      ))}
    </div>
  );
}
