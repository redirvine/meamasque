export const dynamic = "force-dynamic";

import { db } from "@/db";
import { images, users, categories } from "@/db/schema";
import { eq, desc, and, ne, or, isNull } from "drizzle-orm";
import { ImageGrid } from "@/components/gallery/image-grid";
import { auth } from "../../../../auth";
import Link from "next/link";

export const metadata = {
  title: "Gallery - Meamasque",
  description: "Browse our collection of artwork",
};

export default async function GalleryPage() {
  const session = await auth();
  const isAdmin = !!session;

  // Find the site subject
  const siteSubject = await db.query.users.findFirst({
    where: eq(users.isSiteSubject, true),
  });

  if (!siteSubject) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Gallery</h1>
        <p className="text-gray-500">No artwork to display yet.</p>
      </div>
    );
  }

  // Fetch images for the site subject, excluding Theatre category
  const allImages = await db
    .select({
      id: images.id,
      title: images.title,
      blobUrl: images.blobUrl,
      dateCreated: images.dateCreated,
      description: images.description,
      creatorName: users.name,
      categoryName: categories.name,
    })
    .from(images)
    .leftJoin(users, eq(images.creatorUserId, users.id))
    .leftJoin(categories, eq(images.categoryId, categories.id))
    .where(
      and(
        eq(images.creatorUserId, siteSubject.id),
        or(ne(categories.name, "Theatre"), isNull(categories.name))
      )
    )
    .orderBy(desc(images.createdAt));

  // Group images by category
  const grouped = new Map<string, typeof allImages>();
  for (const img of allImages) {
    const key = img.categoryName ?? "Other";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(img);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {siteSubject.name ?? "Gallery"}
        </h1>
        {isAdmin && (
          <Link
            href="/admin/images/new?redirect=/gallery"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Upload
          </Link>
        )}
      </div>
      {grouped.size === 0 ? (
        <div className="py-20 text-center text-gray-500">
          <p>No artwork to display yet.</p>
        </div>
      ) : (
        Array.from(grouped.entries()).map(([categoryName, imgs]) => (
          <section key={categoryName} className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">
              {categoryName}
            </h2>
            <ImageGrid images={imgs} isAdmin={isAdmin} redirectPath="/gallery" />
          </section>
        ))
      )}
    </div>
  );
}
