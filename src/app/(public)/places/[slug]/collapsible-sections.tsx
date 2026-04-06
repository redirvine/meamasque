"use client";

import { ChevronDown } from "lucide-react";
import { PlaceMemories } from "./place-memories";
import { AddMemoryForm } from "./add-memory-form";
import { ImageGrid } from "@/components/gallery/image-grid";

export function CollapsibleSections({
  description,
  memoryCount,
  placeId,
  placeName,
  additionalPhotos,
  isAdmin,
  currentUserId,
  redirectPath,
}: {
  description: string | null;
  memoryCount: number;
  placeId: string;
  placeName: string;
  additionalPhotos?: {
    id: string;
    title: string;
    blobUrl: string;
    thumbnailUrl?: string | null;
    dateCreated: string | null;
    description?: string | null;
    commentCount?: number;
    likeCount?: number;
  }[];
  isAdmin: boolean;
  currentUserId?: string;
  redirectPath?: string;
}) {
  const hasAdditionalPhotos = additionalPhotos && additionalPhotos.length > 0;
  const hasSections = !!description || memoryCount > 0 || isAdmin || hasAdditionalPhotos;

  if (!hasSections) return null;

  return (
    <div>
      {description && (
        <details className="mt-8 group" open>
          <summary className="mb-3 flex cursor-pointer list-none items-center gap-2 text-xl font-semibold [&::-webkit-details-marker]:hidden">
            <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-0 -rotate-90" />
            Description
          </summary>
          <div className="prose prose-gray max-w-none whitespace-pre-wrap text-gray-700">
            {description}
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
            <PlaceMemories
              placeId={placeId}
              placeName={placeName}
              memoryCount={memoryCount}
            />
          )}
          {isAdmin && (
            <div className={memoryCount > 0 ? "mt-4" : ""}>
              <AddMemoryForm placeId={placeId} />
            </div>
          )}
        </details>
      )}

      {hasAdditionalPhotos && (
        <details className="mt-8 group" open>
          <summary className="mb-4 flex cursor-pointer list-none items-center gap-2 text-xl font-semibold [&::-webkit-details-marker]:hidden">
            <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-0 -rotate-90" />
            Photos
            <span className="text-sm font-normal text-gray-500">
              ({additionalPhotos.length})
            </span>
          </summary>
          <ImageGrid images={additionalPhotos} isAdmin={isAdmin} currentUserId={currentUserId} redirectPath={redirectPath} />
        </details>
      )}
    </div>
  );
}
