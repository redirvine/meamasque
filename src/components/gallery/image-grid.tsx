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
  thumbnailUrl?: string | null;
  dateCreated: string | null;
  creatorName?: string | null;
  description?: string | null;
  featured?: boolean | null;
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

  const featured = images.filter((img) => img.featured);
  const regular = images.filter((img) => !img.featured);

  const renderCard = (image: GalleryImage, large = false) => (
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
        className={`group block w-full overflow-hidden rounded-lg border bg-white text-left transition-shadow hover:shadow-lg ${large ? "h-full" : ""}`}
      >
        <div className={`overflow-hidden ${large ? "aspect-auto h-full min-h-[300px]" : "aspect-square"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.thumbnailUrl ?? image.blobUrl}
            alt={image.title}
            className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className={`p-3 ${large ? "absolute bottom-0 left-0 right-0 rounded-b-lg bg-gradient-to-t from-black/70 to-transparent text-white" : ""}`}>
          <p className={`truncate font-medium ${large ? "text-base" : "text-sm"}`}>{image.title}</p>
          <div className={`mt-1 flex items-center gap-2 text-xs ${large ? "text-white/70" : "text-gray-500"}`}>
            {image.creatorName && <span>{image.creatorName}</span>}
            {image.creatorName && image.dateCreated && <span>&middot;</span>}
            {image.dateCreated && <span>{image.dateCreated}</span>}
          </div>
        </div>
      </button>
    </div>
  );

  return (
    <>
      {featured.map((featuredImage, i) => {
        // For each featured image, pair it with the next batch of regular images
        const batchSize = 4;
        const batchStart = i * batchSize;
        const sideImages = regular.slice(batchStart, batchStart + batchSize);

        return (
          <div key={featuredImage.id} className="mb-4 grid gap-4 md:grid-cols-2">
            {renderCard(featuredImage, true)}
            {sideImages.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {sideImages.map((img) => renderCard(img))}
              </div>
            )}
          </div>
        );
      })}

      {/* Remaining regular images not paired with featured */}
      {featured.length > 0 && regular.length > featured.length * 4 && (
        <div className="grid items-start gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {regular.slice(featured.length * 4).map((image) => renderCard(image))}
        </div>
      )}

      {/* If no featured images, show all in regular grid */}
      {featured.length === 0 && (
        <div className="grid items-start gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {regular.map((image) => renderCard(image))}
        </div>
      )}

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
