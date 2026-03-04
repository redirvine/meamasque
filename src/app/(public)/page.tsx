export const dynamic = "force-dynamic";

import { db } from "@/db";
import { images, ancestors, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { auth } from "../../../auth";
import { ImageSlideshow } from "@/components/gallery/image-slideshow";

export default async function HomePage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  const allImages = await db
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
    .orderBy(desc(images.createdAt));

  return (
    <ImageSlideshow images={allImages} isAdmin={isAdmin} redirectPath="/" fullScreen />
  );
}
