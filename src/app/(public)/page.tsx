export const dynamic = "force-dynamic";

import { db } from "@/db";
import { images, ancestors, users, siteAbout } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { auth } from "../../../auth";
import { ImageSlideshow } from "@/components/gallery/image-slideshow";

export default async function HomePage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  const [allImages, about] = await Promise.all([
    db
      .select({
        id: images.id,
        title: images.title,
        blobUrl: images.blobUrl,
        dateCreated: images.dateCreated,
        description: images.description,
        slideshowOverlayText: images.slideshowOverlayText,
        creatorName: sql<string | null>`COALESCE(${users.name}, ${ancestors.name})`,
      })
      .from(images)
      .leftJoin(ancestors, eq(images.ancestorId, ancestors.id))
      .leftJoin(users, eq(images.creatorUserId, users.id))
      .where(eq(images.visibility, "public"))
      .orderBy(desc(images.createdAt)),
    db.query.siteAbout.findFirst(),
  ]);

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col md:flex-row">
      {/* Slideshow column */}
      <div className="min-h-[50dvh] w-full md:w-[60%] md:min-h-0 md:h-full p-6 md:p-12 md:pr-4">
        <ImageSlideshow images={allImages} isAdmin={isAdmin} redirectPath="/" fullScreen fillParent />
      </div>

      {/* About column */}
      <div className="flex w-full flex-col justify-center px-4 py-8 md:w-[40%] md:py-0 md:pl-0 md:pr-6">
        <h1 className="mb-4 text-3xl font-bold">{about?.name ?? "Mary Elizabeth Atwood"}</h1>
        {about?.bio && (
          <p className="whitespace-pre-wrap text-gray-700">{about.bio}</p>
        )}
      </div>
    </div>
  );
}
