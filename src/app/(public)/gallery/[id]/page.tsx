export const dynamic = "force-dynamic";

import { db } from "@/db";
import { images, artists, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { hasFamilyAccess } from "@/lib/family-access";
import { auth } from "../../../../../auth";

export default async function ImageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const results = await db
    .select({
      id: images.id,
      title: images.title,
      description: images.description,
      blobUrl: images.blobUrl,
      dateCreated: images.dateCreated,
      visibility: images.visibility,
      artistName: artists.name,
      artistSlug: artists.slug,
      categoryName: categories.name,
    })
    .from(images)
    .leftJoin(artists, eq(images.artistId, artists.id))
    .leftJoin(categories, eq(images.categoryId, categories.id))
    .where(eq(images.id, id))
    .limit(1);

  const image = results[0];

  if (!image) notFound();

  const [familyAccess, session] = await Promise.all([
    hasFamilyAccess(),
    auth(),
  ]);
  if (image.visibility === "private" && !familyAccess) {
    notFound();
  }
  const isAdmin = !!session;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/gallery"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Gallery
      </Link>

      <div className="overflow-hidden rounded-lg border bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.blobUrl}
          alt={image.title}
          className="w-full"
        />
      </div>

      <div className="mt-6">
        <div className="flex items-start gap-2">
          <h1 className="text-2xl font-bold">{image.title}</h1>
          {isAdmin && (
            <Link
              href={`/admin/images/${image.id}/edit`}
              className="mt-0.5 flex-shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              title="Edit image"
            >
              <Pencil className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {image.artistName && (
            <Link
              href={`/artists/${image.artistSlug}`}
              className="text-sm text-blue-600 hover:underline"
            >
              {image.artistName}
            </Link>
          )}
          {image.dateCreated && (
            <span className="text-sm text-gray-500">{image.dateCreated}</span>
          )}
          {image.categoryName && (
            <Badge variant="secondary">{image.categoryName}</Badge>
          )}
        </div>

        {image.description && (
          <p className="mt-4 text-gray-600">{image.description}</p>
        )}
      </div>
    </div>
  );
}
