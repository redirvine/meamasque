"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CommentsSection } from "@/components/comments/comments-section";

interface GalleryImage {
  id: string;
  title: string;
  blobUrl: string;
  thumbnailUrl?: string | null;
  dateCreated: string | null;
  creatorName?: string | null;
  description?: string | null;
  featured?: boolean | null;
  commentCount?: number;
}

export function ImageGrid({ images, isAdmin = false, currentUserId, redirectPath, categoryDescription, categoryDescriptionHeader }: { images: GalleryImage[]; isAdmin?: boolean; currentUserId?: string; redirectPath?: string; categoryDescription?: string | null; categoryDescriptionHeader?: string | null }) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  if (images.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500">
        <p>No artwork to display yet.</p>
      </div>
    );
  }

  const allFeatured = images.filter((img) => img.featured);
  const featured = allFeatured.slice(0, 1);
  const regular = [...allFeatured.slice(1), ...images.filter((img) => !img.featured)];

  const renderCard = (image: GalleryImage, large = false) => (
    <div key={image.id} className="relative">
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
            {(image.commentCount ?? 0) > 0 && (
              <>
                {(image.creatorName || image.dateCreated) && <span>&middot;</span>}
                <span className="inline-flex items-center gap-0.5">
                  <MessageCircle className="h-3 w-3" />
                  {image.commentCount}
                </span>
              </>
            )}
          </div>
        </div>
      </button>
    </div>
  );

  return (
    <>
      {featured.map((featuredImage) => {
        const hasDescription = categoryDescription?.trim();

        return (
          <div key={featuredImage.id}>
            {/* Row 1: featured image + description text */}
            <div className="mb-4 grid gap-4 md:grid-cols-2 md:min-h-[75vh]">
              {renderCard(featuredImage, true)}
              {hasDescription && (
                <div className="p-4">
                  {categoryDescriptionHeader?.trim() && (
                    <h2 className="mb-2 text-xl font-bold leading-tight text-gray-900">{categoryDescriptionHeader}</h2>
                  )}
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{categoryDescription}</p>
                </div>
              )}
            </div>

            {/* Row 2+: remaining images in regular grid */}
            {regular.length > 0 && (
              <div className="grid items-start gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {regular.map((image) => renderCard(image))}
              </div>
            )}
          </div>
        );
      })}

      {/* No featured: all images in regular grid */}
      {featured.length === 0 && regular.length > 0 && (
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
              <CommentsSection
                resourceType="image"
                resourceId={selectedImage.id}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
