import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { siteAbout, images } from "@/db/schema";
import { auth } from "../../../../auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateAboutSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().optional().nullable(),
  artistStatement: z.string().optional().nullable(),
  photoId: z.string().optional().nullable(),
});

async function getOrCreateAbout() {
  const existing = await db.query.siteAbout.findFirst();
  if (existing) return existing;

  const [created] = await db
    .insert(siteAbout)
    .values({ name: "Mary Elizabeth Atwood" })
    .returning();
  return created;
}

export async function GET() {
  const about = await getOrCreateAbout();

  let photoUrl: string | null = null;
  if (about.photoId) {
    const img = await db.query.images.findFirst({
      where: eq(images.id, about.photoId),
      columns: { blobUrl: true },
    });
    photoUrl = img?.blobUrl ?? null;
  }

  return NextResponse.json({ ...about, photoUrl });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateAboutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const about = await getOrCreateAbout();

  const { eq } = await import("drizzle-orm");
  const [updated] = await db
    .update(siteAbout)
    .set(parsed.data)
    .where(eq(siteAbout.id, about.id))
    .returning();

  return NextResponse.json(updated);
}
