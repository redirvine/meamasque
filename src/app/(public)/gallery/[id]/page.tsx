export const dynamic = "force-dynamic";

import { db } from "@/db";
import { images, ancestors, users, categories } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
      creatorName: sql<string | null>`COALESCE(${users.name}, ${ancestors.name})`,
      creatorSlug: ancestors.slug,
      categoryName: categories.name,
    })
    .from(images)
    .leftJoin(ancestors, eq(images.ancestorId, ancestors.id))
    .leftJoin(users, eq(images.creatorUserId, users.id))
    .leftJoin(categories, eq(images.categoryId, categories.id))
    .where(eq(images.id, id))
    .limit(1);

  const image = results[0];

  if (!image) notFound();

  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

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
              href={`/admin/images/${image.id}/edit?redirect=${encodeURIComponent(`/gallery/${image.id}`)}`}
              className="mt-0.5 flex-shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              title="Edit image"
            >
              <Pencil className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {image.creatorName && (
            image.creatorSlug ? (
              <Link
                href={`/ancestors/${image.creatorSlug}`}
                className="text-sm text-blue-600 hover:underline"
              >
                {image.creatorName}
              </Link>
            ) : (
              <span className="text-sm text-gray-600">
                {image.creatorName}
              </span>
            )
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
