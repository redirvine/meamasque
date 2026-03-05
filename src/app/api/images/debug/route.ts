import { NextResponse } from "next/server";
import { db } from "@/db";
import { images } from "@/db/schema";
import { auth } from "../../../../../auth";
import { isNull } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const noThumb = await db
    .select({
      id: images.id,
      title: images.title,
      blobUrl: images.blobUrl,
      thumbnailUrl: images.thumbnailUrl,
    })
    .from(images)
    .where(isNull(images.thumbnailUrl));

  return NextResponse.json(noThumb);
}
