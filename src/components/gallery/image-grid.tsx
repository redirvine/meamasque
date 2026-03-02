"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface GalleryImage {
  id: string;
  title: string;
  blobUrl: string;
  dateCreated: string | null;
  creatorName?: string | null;
  description?: string | null;
}

export function ImageGrid({ images, isAdmin = false, redirectPath }: { images: GalleryImage[]; isAdmin?: boolean; redirectPath?: string }) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  if (images.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500">
        <p>No artwork to display yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {images.map((image) => (
          <div key={image.id} className="relative">
            {isAdmin && (
              <Link
                href={`/admin/images/${image.id}/edit${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
                className="absolute top-2 right-2 z-10 rounded-full bg-white/80 p-1.5 text-gray-500 shadow transition-colors hover:bg-white hover:text-gray-700"
                title="Edit image"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Link>
            )}
            <button
              type="button"
              onClick={() => setSelectedImage(image)}
              className="group block w-full overflow-hidden rounded-lg border bg-white text-left transition-shadow hover:shadow-lg"
            >
              <div className="aspect-square overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.blobUrl}
                  alt={image.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium">{image.title}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  {image.creatorName && <span>{image.creatorName}</span>}
                  {image.creatorName && image.dateCreated && <span>&middot;</span>}
                  {image.dateCreated && <span>{image.dateCreated}</span>}
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={(open) => { if (!open) setSelectedImage(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedImage && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedImage.title}</DialogTitle>
                {(selectedImage.creatorName || selectedImage.dateCreated) && (
                  <DialogDescription>
                    {selectedImage.creatorName}
                    {selectedImage.creatorName && selectedImage.dateCreated && " \u00b7 "}
                    {selectedImage.dateCreated}
                  </DialogDescription>
                )}
              </DialogHeader>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage.blobUrl}
                alt={selectedImage.title}
                className="w-full rounded-md"
              />
              {selectedImage.description && (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedImage.description}
                </p>
              )}
              {isAdmin && (
                <div className="flex justify-end">
                  <Link
                    href={`/admin/images/${selectedImage.id}/edit${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
