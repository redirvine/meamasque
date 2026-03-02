export const dynamic = "force-dynamic";

import { db } from "@/db";
import { images, ancestors, users, siteAbout } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import Link from "next/link";

export default async function HomePage() {
  const [result, about] = await Promise.all([
    db
      .select({
        id: images.id,
        title: images.title,
        blobUrl: images.blobUrl,
        creatorName: sql<string | null>`COALESCE(${users.name}, ${ancestors.name})`,
      })
      .from(images)
      .leftJoin(ancestors, eq(images.ancestorId, ancestors.id))
      .leftJoin(users, eq(images.creatorUserId, users.id))
      .where(eq(images.visibility, "public"))
      .orderBy(desc(images.createdAt))
      .limit(1),
    db.query.siteAbout.findFirst(),
  ]);

  const image = result[0];

  if (!image) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center text-gray-500">
        <p>No artwork to display yet.</p>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.blobUrl}
        alt={image.title}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Centered about text overlay */}
      {about?.bio && (
        <div className="absolute inset-0 flex items-center justify-center px-8">
          <p className="max-w-2xl whitespace-pre-wrap text-center italic font-[family-name:var(--font-script)] text-2xl leading-relaxed text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] md:text-3xl">
            {about.bio}
          </p>
        </div>
      )}

      {/* Bottom gradient overlay with info */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-6 pb-6 pt-20">
        <Link
          href={`/gallery/${image.id}`}
          className="group text-white transition-colors hover:text-white/80"
        >
          <h2 className="text-xl font-semibold group-hover:underline">
            {image.title}
          </h2>
          {image.creatorName && (
            <p className="mt-1 text-sm text-white/70">
              {image.creatorName}
            </p>
          )}
        </Link>
      </div>
    </div>
  );
}
