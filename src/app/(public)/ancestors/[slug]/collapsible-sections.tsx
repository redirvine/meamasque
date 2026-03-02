"use client";

import { ChevronDown } from "lucide-react";
import { AncestorMemories } from "./ancestor-memories";
import { AddMemoryForm } from "./add-memory-form";
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
  redirectPath,
}: {
  bio: string | null;
  memoryCount: number;
  ancestorId: string;
  ancestorName: string;
  photoGroups: PhotoGroup[];
  isAdmin: boolean;
  redirectPath?: string;
}) {
  const hasSections = !!bio || memoryCount > 0 || isAdmin || photoGroups.length > 0;

  if (!hasSections) return null;

  return (
    <div>
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

      {(memoryCount > 0 || isAdmin) && (
        <details className="mt-8 group" open>
          <summary className="mb-3 flex cursor-pointer list-none items-center gap-2 text-xl font-semibold [&::-webkit-details-marker]:hidden">
            <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-0 -rotate-90" />
            Memories
            {memoryCount > 0 && (
              <span className="text-sm font-normal text-gray-500">
                ({memoryCount})
              </span>
            )}
          </summary>
          {memoryCount > 0 && (
            <AncestorMemories
              ancestorId={ancestorId}
              ancestorName={ancestorName}
              memoryCount={memoryCount}
            />
          )}
          {isAdmin && (
            <div className={memoryCount > 0 ? "mt-4" : ""}>
              <AddMemoryForm ancestorId={ancestorId} />
            </div>
          )}
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
          <ImageGrid images={images} isAdmin={isAdmin} redirectPath={redirectPath} />
        </details>
      ))}
    </div>
  );
}
